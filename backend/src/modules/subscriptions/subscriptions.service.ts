import * as repository from './subscriptions.repository.js';
import * as mealPlanRepository from '../meal-plans/meal-plans.repository.js';
import * as userRepository from '../users/users.repository.js';
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

  const student = await userRepository.findById(data.studentUserId);
  if (!student) {
    throw new ApiError('Estudiante no encontrado', 404, 'STUDENT_NOT_FOUND');
  }

  if (student.role !== 'student') {
    throw new ApiError('El usuario no es un estudiante', 400, 'USER_IS_NOT_STUDENT');
  }

  if (student.restaurantId && student.restaurantId !== restaurantId) {
    throw new ApiError('El estudiante pertenece a otro restaurante', 403, 'FORBIDDEN');
  }

  const mealPlan = await mealPlanRepository.findById(data.mealPlanId);
  if (!mealPlan) {
    throw new ApiError('Plan de comida no encontrado', 404, 'MEAL_PLAN_NOT_FOUND');
  }

  if (mealPlan.restaurantId !== restaurantId) {
    throw new ApiError('El plan de comida no pertenece al restaurante especificado', 403, 'FORBIDDEN');
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

export async function update(
  id: string,
  data: { status?: string; remainingDays?: number },
  userRole: string,
  userRestaurantId: string | null
) {
  const subscription = await getById(id);
  if (userRole !== 'superadmin' && subscription.restaurantId !== userRestaurantId) {
    throw new ApiError('No autorizado para operar en esta suscripción', 403, 'FORBIDDEN');
  }
  return repository.update(id, data);
}

export async function getActiveByStudent(studentId: string) {
  return repository.findActiveByStudent(studentId);
}

export { repository };
