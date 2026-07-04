import * as repository from './daily-meals.repository.js';
import * as subscriptionRepository from '../subscriptions/subscriptions.repository.js';
import { ApiError } from '../../shared/index.js';

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
  }

  return repository.findMany(queryFilters);
}

export async function getById(id: string) {
  const meal = await repository.findById(id);
  if (!meal) {
    throw new ApiError('Consumo no encontrado', 404, 'DAILY_MEAL_NOT_FOUND');
  }
  return meal;
}

export async function create(data: {
  subscriptionId: string;
  mealDate: string;
  status: string;
  validationSource?: string;
}, userId: string) {
  const subscription = await subscriptionRepository.findById(data.subscriptionId);
  if (!subscription) {
    throw new ApiError('Suscripción no encontrada', 404, 'SUBSCRIPTION_NOT_FOUND');
  }
  if (subscription.status !== 'active') {
    throw new ApiError('La suscripción no está activa', 400, 'SUBSCRIPTION_NOT_ACTIVE');
  }

  const mealDate = new Date(data.mealDate);

  const existing = await repository.findBySubscriptionAndDate(
    data.subscriptionId, subscription.studentId, mealDate,
  );
  if (existing) {
    throw new ApiError('Ya existe un registro para esta fecha', 409, 'DAILY_MEAL_ALREADY_EXISTS');
  }

  const meal = await repository.create({
    subscriptionId: data.subscriptionId,
    studentId: subscription.studentId,
    date: mealDate,
    status: data.status,
    registeredBy: userId,
    validationMethod: data.validationSource,
  });

  if (data.status === 'consumed' && subscription.remainingDays > 0) {
    await subscriptionRepository.update(data.subscriptionId, {
      remainingDays: subscription.remainingDays - 1,
    });
  }

  return meal;
}

export { repository };
