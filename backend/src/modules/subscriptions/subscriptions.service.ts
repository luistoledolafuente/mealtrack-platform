import * as repository from './subscriptions.repository.js';
import * as mealPlanRepository from '../meal-plans/meal-plans.repository.js';
import { ApiError } from '../../shared/index.js';

export async function list(userId: string, role: string, restaurantId: string | null) {
  if (role === 'student') {
    return repository.findByStudent(userId);
  }
  if (restaurantId) {
    return repository.findByRestaurant(restaurantId);
  }
  return [];
}

export async function getById(id: string) {
  const subscription = await repository.findById(id);
  if (!subscription) {
    throw new ApiError('Suscripción no encontrada', 404, 'SUBSCRIPTION_NOT_FOUND');
  }
  return subscription;
}

export async function create(data: {
  studentUserId: string;
  mealPlanId: string;
  startDate: string;
}, registeredBy: string, restaurantId: string | null) {
  if (!restaurantId) {
    throw new ApiError('Contexto de restaurante requerido', 400, 'TENANT_REQUIRED');
  }

  const mealPlan = await mealPlanRepository.findById(data.mealPlanId);
  if (!mealPlan) {
    throw new ApiError('Plan de comida no encontrado', 404, 'MEAL_PLAN_NOT_FOUND');
  }

  return repository.create({
    studentId: data.studentUserId,
    mealPlanId: data.mealPlanId,
    restaurantId,
    startDate: new Date(data.startDate),
    contractedDays: mealPlan.durationDays,
    remainingDays: mealPlan.durationDays,
  });
}

export async function update(id: string, data: { status?: string; remainingDays?: number }) {
  await getById(id);
  return repository.update(id, data);
}

export async function getActiveByStudent(studentId: string) {
  return repository.findActiveByStudent(studentId);
}

export { repository };
