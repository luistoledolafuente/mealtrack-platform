import * as repository from './adjustment-requests.repository.js';
import * as dailyMealRepository from '../daily-meals/daily-meals.repository.js';
import * as subscriptionRepository from '../subscriptions/subscriptions.repository.js';
import * as notificationRepository from '../notifications/notifications.repository.js';
import { ApiError } from '../../shared/index.js';

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
}, userId: string) {
  const dailyMeal = await dailyMealRepository.findById(data.dailyMealId);
  if (!dailyMeal) {
    throw new ApiError('Consumo diario no encontrado', 404, 'DAILY_MEAL_NOT_FOUND');
  }

  return repository.create({
    dailyMealId: data.dailyMealId,
    requesterId: userId,
    reason: data.reason,
  });
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

  const updated = await repository.review(id, {
    status: data.decision,
    reviewerId,
    resolution: data.resolutionNotes,
  });

  await notificationRepository.create({
    userId: request.requesterId,
    type: 'adjustment',
    title: data.decision === 'approved' ? 'Solicitud de ajuste aprobada' : 'Solicitud de ajuste rechazada',
    message: data.decision === 'approved' ? 'Se devolvió el día de consumo a tu suscripción' : 'Tu solicitud de ajuste fue rechazada',
  });

  if (data.decision === 'approved') {
    // If the meal was registered as consumed, we refund it
    if (dailyMeal.status === 'consumed') {
      await subscriptionRepository.update(dailyMeal.subscriptionId, {
        remainingDays: subscription.remainingDays + 1,
      });
    }
    await dailyMealRepository.updateStatus(request.dailyMealId, 'adjusted');
  }

  return updated;
}
