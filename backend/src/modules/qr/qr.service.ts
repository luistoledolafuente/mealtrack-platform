import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { ApiError } from '../../shared/index.js';
import * as subscriptionRepository from '../subscriptions/subscriptions.repository.js';
import * as dailyMealsRepository from '../daily-meals/daily-meals.repository.js';
import * as auditService from '../audit/audit.service.js';

interface QrPayload {
  subscriptionId: string;
  studentId: string;
  type: string;
}

export async function issueQrToken(subscriptionId: string, studentId: string) {
  const subscription = await subscriptionRepository.findById(subscriptionId);
  if (!subscription) {
    throw new ApiError('Suscripción no encontrada', 404, 'SUBSCRIPTION_NOT_FOUND');
  }

  if (subscription.studentId !== studentId) {
    throw new ApiError('Acceso denegado', 403, 'FORBIDDEN');
  }

  if (subscription.status !== 'active') {
    throw new ApiError('La suscripción no está activa', 400, 'SUBSCRIPTION_NOT_ACTIVE');
  }

  const token = jwt.sign(
    {
      subscriptionId,
      studentId,
      type: 'qr_consumption',
    },
    env.jwt.secret,
    { expiresIn: '10m' }
  );

  return {
    token,
    expiresIn: '10 minutos',
  };
}

export async function validateQrToken(token: string, validatorId: string, validatorRole: string, validatorRestaurantId: string | null) {
  let decoded: QrPayload;
  try {
    decoded = jwt.verify(token, env.jwt.secret) as QrPayload;
  } catch (err) {
    throw new ApiError('Código QR inválido o expirado', 400, 'QR_EXPIRED');
  }

  if (decoded.type !== 'qr_consumption') {
    throw new ApiError('Token QR inválido', 400, 'INVALID_TOKEN');
  }

  const { subscriptionId, studentId } = decoded;

  const subscription = await subscriptionRepository.findById(subscriptionId);
  if (!subscription) {
    throw new ApiError('Suscripción no encontrada', 404, 'SUBSCRIPTION_NOT_FOUND');
  }

  if (subscription.status !== 'active') {
    throw new ApiError('La suscripción no está activa', 400, 'SUBSCRIPTION_NOT_ACTIVE');
  }

  // Multi-tenant check: admin must belong to the same restaurant (except superadmin)
  if (validatorRole !== 'superadmin' && subscription.restaurantId !== validatorRestaurantId) {
    throw new ApiError('No tienes permiso para validar en este restaurante', 403, 'TENANT_ACCESS_DENIED');
  }

  const today = new Date();
  const mealDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const existing = await dailyMealsRepository.findBySubscriptionAndDate(
    subscriptionId, studentId, mealDate
  );
  if (existing) {
    throw new ApiError('Ya se registró un consumo para el día de hoy', 409, 'DAILY_MEAL_ALREADY_EXISTS');
  }

  const meal = await dailyMealsRepository.create({
    subscriptionId,
    studentId,
    date: mealDate,
    status: 'consumed',
    registeredBy: validatorId,
    validationMethod: 'QR',
  });

  if (subscription.remainingDays > 0) {
    await subscriptionRepository.update(subscriptionId, {
      remainingDays: subscription.remainingDays - 1,
    });
  }

  await auditService.create({
    userId: validatorId,
    action: 'VALIDATE',
    entity: 'DailyMeal',
    entityId: meal.id,
    detail: {
      subscriptionId,
      studentId,
      validationMethod: 'QR',
    },
  });

  return {
    id: meal.id,
    subscriptionId: meal.subscriptionId,
    studentId: meal.studentId,
    date: meal.date,
    status: meal.status,
    registeredBy: meal.registeredBy,
    validationMethod: meal.validationMethod,
    studentName: subscription.student.fullName,
    planName: subscription.mealPlan.name,
  };
}
