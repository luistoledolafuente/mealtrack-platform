import crypto from 'crypto';
import * as repository from './users.repository.js';
import * as mealPlanRepository from '../meal-plans/meal-plans.repository.js';
import * as subscriptionsService from '../subscriptions/subscriptions.service.js';
import * as auditService from '../audit/audit.service.js';
import * as notificationRepository from '../notifications/notifications.repository.js';
import { ApiError, hashPassword, comparePassword } from '../../shared/index.js';

function generateTemporaryPassword(): string {
  return `Temporal-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

export async function getProfile(userId: string) {
  const user = await repository.findById(userId);
  if (!user) {
    throw new ApiError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  }
  return user;
}

export async function updateProfile(userId: string, data: { fullName?: string }) {
  const user = await repository.findById(userId);
  if (!user) {
    throw new ApiError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  }
  return repository.update(userId, data);
}

export async function create(
  data: {
    fullName: string;
    email: string;
    phone?: string;
    password?: string;
    role: string;
    restaurantId?: string;
    planId?: string;
  },
  operatorId: string,
  operatorRole: string,
  operatorRestaurantId: string | null
) {
  const existing = await repository.findByEmail(data.email);
  if (existing) {
    throw new ApiError('Ya existe un usuario con ese correo', 409, 'EMAIL_ALREADY_EXISTS');
  }

  const role = data.role === 'admin' ? 'admin' : 'student';

  if (role === 'admin' && operatorRole !== 'superadmin') {
    throw new ApiError('Solo el superadmin puede crear administradores', 403, 'FORBIDDEN');
  }

  let restaurantId = data.restaurantId ?? null;
  if (operatorRole === 'admin') {
    restaurantId = operatorRestaurantId;
    if (!restaurantId) {
      throw new ApiError('Contexto de restaurante requerido', 400, 'TENANT_REQUIRED');
    }
  }
  if (role === 'student' && !restaurantId) {
    throw new ApiError('El estudiante debe pertenecer a un restaurante', 400, 'TENANT_REQUIRED');
  }

  const providedPassword = data.password ?? generateTemporaryPassword();
  const passwordHash = await hashPassword(providedPassword);
  const isTemporary = data.password === undefined;

  const user = await repository.create({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone ?? null,
    passwordHash,
    role,
    restaurantId,
    mustChangePassword: true,
  });

  await auditService.create({
    userId: operatorId,
    action: 'CREATE',
    entity: 'User',
    entityId: user.id,
    detail: {
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      operatorRole,
      passwordIsTemporary: isTemporary,
    },
  });

  if (isTemporary) {
    await notificationRepository.create({
      userId: user.id,
      type: 'system',
      title: 'Bienvenido a MealTrack',
      message: 'Tu cuenta fue creada. Inicia sesión con tu contraseña temporal y cámbiala al entrar.',
    });
  }

  let createdSubscription: {
    id: string;
    mealPlanId: string;
    mealPlanName: string;
    contractedDays: number;
    remainingDays: number;
  } | undefined;
  if (data.planId) {
    const mealPlan = await mealPlanRepository.findById(data.planId);
    if (!mealPlan) {
      throw new ApiError('Plan de comida no encontrado', 404, 'MEAL_PLAN_NOT_FOUND');
    }
    const subscription = await subscriptionsService.create(
      {
        studentUserId: user.id,
        mealPlanId: data.planId,
        startDate: new Date().toISOString(),
      },
      operatorId,
      restaurantId,
    );
    createdSubscription = {
      id: subscription.id,
      mealPlanId: subscription.mealPlanId,
      mealPlanName: mealPlan.name,
      contractedDays: subscription.contractedDays,
      remainingDays: subscription.remainingDays,
    };
    await auditService.create({
      userId: operatorId,
      action: 'CREATE',
      entity: 'Subscription',
      entityId: subscription.id,
      detail: {
        studentId: user.id,
        mealPlanId: data.planId,
        restaurantId,
        operatorRole,
      },
    });
    await notificationRepository.create({
      userId: user.id,
      type: 'system',
      title: 'Plan asignado',
      message: `Se te asignó el plan «${mealPlan.name}» (${mealPlan.durationDays} días). Revisa tu saldo disponible.`,
    });
  }

  return {
    ...user,
    temporaryPassword: isTemporary ? providedPassword : undefined,
    subscription: createdSubscription,
  };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await repository.findByIdWithPassword(userId);
  if (!user) {
    throw new ApiError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  }

  const passwordMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!passwordMatch) {
    throw new ApiError('Contraseña actual incorrecta', 401, 'INVALID_PASSWORD');
  }

  const passwordHash = await hashPassword(newPassword);
  return repository.updatePassword(userId, passwordHash);
}