import * as repository from './subscriptions.repository.js';
import * as mealPlanRepository from '../meal-plans/meal-plans.repository.js';
import * as userRepository from '../users/users.repository.js';
import * as absenceNoticesRepository from '../absence-notices/absence-notices.repository.js';
import * as operationalClosuresRepository from '../operational-closures/operational-closures.repository.js';
import { ApiError } from '../../shared/index.js';

const MVP_SERVICE = 'lunch';
const MVP_SERVICE_NAME = 'Almuerzo';
const MONTHLY_ABSENCE_LIMIT = 3;

type AbsenceNoticeSummary = {
  id: string;
  date: Date;
  service: string;
  status: string;
  reason: string;
};

type OperationalClosureSummary = {
  id: string;
  startDate: Date;
  endDate: Date;
  services: string[];
  reason: string;
};

export async function list(userId: string, role: string, restaurantId: string | null) {
  if (role === 'student') {
    return repository.findByStudent(userId);
  }
  if (restaurantId) {
    return repository.findByRestaurant(restaurantId);
  }
  return [];
}

export async function getById(id: string, userId?: string, role?: string, restaurantId?: string | null) {
  const subscription = await repository.findById(id);
  if (!subscription) {
    throw new ApiError('Suscripción no encontrada', 404, 'SUBSCRIPTION_NOT_FOUND');
  }
  if (role === 'student' && subscription.studentId !== userId) {
    throw new ApiError('Suscripción no encontrada', 404, 'SUBSCRIPTION_NOT_FOUND');
  }
  if (role === 'admin' && subscription.restaurantId !== restaurantId) {
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

export async function getMySummary(studentId: string, role: string, restaurantId: string | null) {
  if (role !== 'student' || !restaurantId) {
    throw new ApiError('No autorizado', 403, 'FORBIDDEN');
  }

  const subscription = await repository.findActiveByStudent(studentId);
  if (!subscription || subscription.restaurantId !== restaurantId) {
    throw new ApiError('No tienes una suscripción activa', 404, 'SUBSCRIPTION_NOT_FOUND');
  }

  const [absences, closures] = await Promise.all([
    absenceNoticesRepository.findBySubscription(subscription.id) as Promise<AbsenceNoticeSummary[]>,
    operationalClosuresRepository.findByRestaurant(subscription.restaurantId) as Promise<OperationalClosureSummary[]>,
  ]);
  const validityEnd = new Date(subscription.startDate);
  validityEnd.setUTCDate(validityEnd.getUTCDate() + subscription.contractedDays - 1);
  const approvedAbsences = absences.filter((notice) => notice.status === 'approved' && notice.service === MVP_SERVICE);

  return {
    subscriptionId: subscription.id,
    status: subscription.status,
    mealPlanName: subscription.mealPlan.name,
    restaurantName: subscription.restaurant.name,
    validityStartDate: subscription.startDate,
    validityEndDate: validityEnd,
    serviceBalances: [{
      service: MVP_SERVICE,
      serviceName: MVP_SERVICE_NAME,
      contractedCount: subscription.contractedDays,
      remainingCount: subscription.remainingDays,
      included: true,
    }],
    closureAlerts: closures
      .filter((closure) => closure.services.includes(MVP_SERVICE) && closure.endDate >= subscription.startDate)
      .map((closure) => ({
        id: closure.id,
        restaurantName: subscription.restaurant.name,
        reason: closure.reason,
        affectedServices: closure.services,
        startDate: closure.startDate,
        endDate: closure.endDate,
        validityExtendedDays: 0,
      })),
    absences: absences
      .filter((notice) => notice.service === MVP_SERVICE)
      .map((notice) => ({
        id: notice.id,
        date: notice.date,
        service: notice.service,
        status: notice.status,
        reason: notice.reason,
      })),
    monthlyAbsenceLimit: MONTHLY_ABSENCE_LIMIT,
    usedAbsences: approvedAbsences.length,
  };
}

export { repository };
