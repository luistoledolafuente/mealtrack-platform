import * as repository from './daily-meals.repository.js';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../shared/index.js';
import { sanitizeAuditDetail } from '../audit/audit.service.js';

export async function list(filters: {
  studentUserId?: string;
  subscriptionId?: string;
  from?: string;
  to?: string;
  status?: string;
}, userId: string, role: string, restaurantId: string | null) {
  const queryFilters: {
    studentId?: string;
    subscriptionId?: string;
    restaurantId?: string;
    from?: Date;
    to?: Date;
    status?: string;
  } = {};

  if (filters.subscriptionId) queryFilters.subscriptionId = filters.subscriptionId;
  if (filters.status) queryFilters.status = filters.status;
  if (filters.from) queryFilters.from = new Date(filters.from);
  if (filters.to) queryFilters.to = new Date(filters.to);

  if (role === 'student') {
    queryFilters.studentId = userId;
  } else if (restaurantId) {
    queryFilters.restaurantId = restaurantId;
  }

  return repository.findMany(queryFilters);
}

export async function getById(id: string, userId: string, role: string, restaurantId: string | null) {
  const meal = await repository.findById(id);
  if (!meal) {
    throw new ApiError('Consumo no encontrado', 404, 'DAILY_MEAL_NOT_FOUND');
  }
  if (role === 'student' && meal.studentId !== userId) {
    throw new ApiError('Consumo no encontrado', 404, 'DAILY_MEAL_NOT_FOUND');
  }
  if (role === 'admin' && meal.subscription?.restaurantId !== restaurantId) {
    throw new ApiError('Consumo no encontrado', 404, 'DAILY_MEAL_NOT_FOUND');
  }
  return meal;
}

export async function create(
  data: {
    subscriptionId: string;
    mealDate: string;
    status: string;
    validationSource?: string;
    idempotencyKey?: string;
  },
  userId: string,
  userRole: string,
  userRestaurantId: string | null
) {
  const mealDate = new Date(data.mealDate);
  return prisma.$transaction(async (tx) => {
  if (data.idempotencyKey) {
    const prior = await tx.dailyMeal.findUnique({ where: { idempotencyKey: data.idempotencyKey } });
    if (prior) return prior;
  }
  const subscription = await tx.subscription.findUnique({ where: { id: data.subscriptionId } });
  if (!subscription) {
    throw new ApiError('Suscripción no encontrada', 404, 'SUBSCRIPTION_NOT_FOUND');
  }

  // Multi-tenant & Role validation
  if (userRole === 'student' && subscription.studentId !== userId) {
    throw new ApiError('No autorizado para registrar consumos en esta suscripción', 403, 'FORBIDDEN');
  }
  if (userRole === 'admin' && subscription.restaurantId !== userRestaurantId) {
    throw new ApiError('No autorizado para registrar consumos en esta suscripción', 403, 'FORBIDDEN');
  }

  if (subscription.status !== 'active') {
    throw new ApiError('La suscripción no está activa', 400, 'SUBSCRIPTION_NOT_ACTIVE');
  }

  const existing = await tx.dailyMeal.findFirst({ where: { subscriptionId: data.subscriptionId, studentId: subscription.studentId, date: mealDate } });
  if (existing) {
    throw new ApiError('Ya existe un registro para esta fecha', 409, 'DAILY_MEAL_ALREADY_EXISTS');
  }

  if (data.status === 'consumed') {
    const debit = await tx.subscription.updateMany({ where: { id: data.subscriptionId, status: 'active', remainingDays: { gt: 0 } }, data: { remainingDays: { decrement: 1 } } });
    if (debit.count !== 1) throw new ApiError('La suscripción no tiene saldo disponible', 409, 'SUBSCRIPTION_INSUFFICIENT_BALANCE');
  }
  const meal = await tx.dailyMeal.create({ data: {
    subscriptionId: data.subscriptionId,
    studentId: subscription.studentId,
    date: mealDate,
    status: data.status,
    registeredBy: userId,
    validationMethod: data.validationSource, idempotencyKey: data.idempotencyKey,
  }});
  await tx.auditLog.create({ data: {
    userId,
    action: 'CREATE',
    entity: 'DailyMeal',
    entityId: meal.id,
    detail: sanitizeAuditDetail({
      restaurantId: subscription.restaurantId,
      correlationId: data.idempotencyKey,
      subscriptionId: subscription.id,
      studentId: subscription.studentId,
      status: data.status,
      validationSource: data.validationSource,
    }) as Prisma.InputJsonValue,
  }});
  return meal;
  });
}

export { repository };
