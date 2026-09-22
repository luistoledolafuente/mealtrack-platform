import * as repository from './adjustment-requests.repository.js';
import * as dailyMealRepository from '../daily-meals/daily-meals.repository.js';
import * as subscriptionRepository from '../subscriptions/subscriptions.repository.js';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../shared/index.js';
import { sanitizeAuditDetail } from '../audit/audit.service.js';

export async function list(userId: string, role: string, restaurantId: string | null) {
  if (role === 'student') {
    return repository.findByRequester(userId);
  }
  if (restaurantId) {
    return repository.findByDailyMealInRestaurant(restaurantId);
  }
  return [];
}

export async function create(data: {
  dailyMealId: string;
  reason: string;
}, userId: string, userRole: string, userRestaurantId: string | null) {
  const dailyMeal = await dailyMealRepository.findById(data.dailyMealId);
  if (!dailyMeal) {
    throw new ApiError('Consumo diario no encontrado', 404, 'DAILY_MEAL_NOT_FOUND');
  }

  if (userRole === 'student' && dailyMeal.studentId !== userId) {
    throw new ApiError('Consumo diario no encontrado', 404, 'DAILY_MEAL_NOT_FOUND');
  }
  if (userRole === 'admin' && dailyMeal.subscription?.restaurantId !== userRestaurantId) {
    throw new ApiError('Consumo diario no encontrado', 404, 'DAILY_MEAL_NOT_FOUND');
  }

  const adjustment = await repository.create({
    dailyMealId: data.dailyMealId,
    requesterId: userId,
    reason: data.reason,
  });
  await prisma.auditLog.create({ data: {
    userId,
    action: 'CREATE_ADJUSTMENT_REQUEST',
    entity: 'AdjustmentRequest',
    entityId: adjustment.id,
    detail: sanitizeAuditDetail({ restaurantId: dailyMeal.subscription?.restaurantId, correlationId: adjustment.id, dailyMealId: data.dailyMealId }) as never,
  }});
  return adjustment;
}

export async function review(
  id: string,
  data: {
    decision: string;
    resolutionNotes?: string;
  },
  reviewerId: string,
  reviewerRole: string,
  reviewerRestaurantId: string | null
) {
  const request = await repository.findById(id);
  if (!request) {
    throw new ApiError('Solicitud de ajuste no encontrada', 404, 'ADJUSTMENT_NOT_FOUND');
  }

  if (request.status !== 'pending') {
    throw new ApiError('La solicitud ya fue revisada', 409, 'ADJUSTMENT_ALREADY_REVIEWED');
  }

  const dailyMeal = await dailyMealRepository.findById(request.dailyMealId);
  if (!dailyMeal) {
    throw new ApiError('Consumo diario asociado no encontrado', 404, 'DAILY_MEAL_NOT_FOUND');
  }

  const subscription = await subscriptionRepository.findById(dailyMeal.subscriptionId);
  if (!subscription) {
    throw new ApiError('Suscripción asociada no encontrada', 404, 'SUBSCRIPTION_NOT_FOUND');
  }

  // Multi-tenant check: Admin must belong to the same restaurant (except superadmin)
  if (reviewerRole !== 'superadmin' && subscription.restaurantId !== reviewerRestaurantId) {
    throw new ApiError('No autorizado para operar en esta suscripción', 403, 'FORBIDDEN');
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.adjustmentRequest.updateMany({
      where: { id, status: 'pending' },
      data: { status: data.decision, reviewerId, resolution: data.resolutionNotes },
    });
    if (updated.count !== 1) {
      throw new ApiError('La solicitud ya fue revisada', 409, 'ADJUSTMENT_ALREADY_REVIEWED');
    }
    if (data.decision === 'approved') {
      if (dailyMeal.status === 'consumed') {
        await tx.subscription.update({
          where: { id: dailyMeal.subscriptionId },
          data: { remainingDays: { increment: 1 } },
        });
      }
      await tx.dailyMeal.update({ where: { id: request.dailyMealId }, data: { status: 'adjusted' } });
    }
    await tx.notification.create({
      data: {
        userId: request.requesterId,
        type: 'adjustment',
        title: data.decision === 'approved' ? 'Solicitud de ajuste aprobada' : 'Solicitud de ajuste rechazada',
        message: data.decision === 'approved' ? 'Se devolvió el día de consumo a tu suscripción' : 'Tu solicitud de ajuste fue rechazada',
      },
    });
    await tx.auditLog.create({ data: {
      userId: reviewerId,
      action: 'REVIEW_ADJUSTMENT_REQUEST',
      entity: 'AdjustmentRequest',
      entityId: id,
      detail: sanitizeAuditDetail({ restaurantId: subscription.restaurantId, correlationId: id, decision: data.decision, dailyMealId: request.dailyMealId }) as never,
    }});
    const result = await tx.adjustmentRequest.findUnique({ where: { id } });
    if (!result) throw new ApiError('Solicitud de ajuste no encontrada', 404, 'ADJUSTMENT_NOT_FOUND');
    return result;
  });
}
