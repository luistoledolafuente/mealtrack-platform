import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';
import { env } from '../../config/env.js';
import { ApiError } from '../../shared/index.js';
import { prisma } from '../../config/database.js';
import * as dailyMealsService from '../daily-meals/daily-meals.service.js';
import * as subscriptionRepository from '../subscriptions/subscriptions.repository.js';
import * as dailyMealsRepository from '../daily-meals/daily-meals.repository.js';
import * as auditService from '../audit/audit.service.js';

interface QrPayload {
  subscriptionId: string;
  studentId: string;
  type: string;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function createManualCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createRestaurantQrSession(
  data: { service: string; expiresInSeconds?: number },
  issuedById: string,
  restaurantId: string | null,
) {
  if (!restaurantId) {
    throw new ApiError('Contexto de restaurante requerido', 400, 'TENANT_CONTEXT_REQUIRED');
  }
  const expiresInSeconds = data.expiresInSeconds ?? 60;
  const token = randomBytes(32).toString('base64url');
  const manualCode = createManualCode();
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  const session = await prisma.qrSession.create({
    data: {
      restaurantId,
      service: data.service,
      tokenHash: sha256(token),
      codeHash: sha256(manualCode),
      expiresAt,
      issuedById,
    },
  });
  await auditService.record({
    actorId: issuedById,
    action: 'CREATE_QR_SESSION',
    entity: 'QrSession',
    entityId: session.id,
    restaurantId,
    correlationId: session.id,
    detail: { service: session.service, expiresAt: session.expiresAt.toISOString() },
  });
  return {
    sessionId: session.id,
    qrToken: token,
    manualCode,
    service: session.service,
    expiresAt: session.expiresAt,
  };
}

export async function scanRestaurantQrSession(
  data: { qrToken?: string; manualCode?: string },
  studentId: string,
  idempotencyKey: string,
  expectedService?: string,
) {
  const hash = sha256(data.qrToken ?? data.manualCode ?? '');
  const session = await prisma.qrSession.findFirst({
    where: {
      OR: [{ tokenHash: hash }, { codeHash: hash }],
      revokedAt: null,
    },
  });
  if (!session) {
    throw new ApiError('QR o código inválido', 400, 'INVALID_QR');
  }
  if (session.expiresAt.getTime() <= Date.now()) {
    throw new ApiError('El QR ha expirado', 400, 'EXPIRED_QR');
  }
  if (expectedService && session.service !== expectedService) {
    throw new ApiError('Este QR no corresponde al servicio habilitado', 400, 'INVALID_QR');
  }
  const subscription = await prisma.subscription.findFirst({
    where: { studentId, restaurantId: session.restaurantId, status: 'active' },
    include: { restaurant: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  if (!subscription) {
    throw new ApiError('No tienes una suscripción activa en este restaurante', 404, 'SUBSCRIPTION_NOT_FOUND');
  }
  let meal;
  try {
    meal = await dailyMealsService.create({
      subscriptionId: subscription.id,
      mealDate: new Date().toISOString(),
      status: 'consumed',
      validationSource: 'QR',
      idempotencyKey,
    }, studentId, 'student', null);
  } catch (error) {
    if (error instanceof ApiError && error.errorCode === 'SUBSCRIPTION_INSUFFICIENT_BALANCE') {
      throw new ApiError(error.message, 409, 'INSUFFICIENT_BALANCE');
    }
    if (error instanceof ApiError && error.errorCode === 'DAILY_MEAL_ALREADY_EXISTS') {
      throw new ApiError(error.message, 409, 'DUPLICATE_CONSUMPTION');
    }
    throw error;
  }
  await auditService.record({
    actorId: studentId,
    action: 'SCAN_QR_CONSUMPTION',
    entity: 'DailyMeal',
    entityId: meal.id,
    restaurantId: session.restaurantId,
    correlationId: idempotencyKey,
    detail: { subscriptionId: subscription.id, service: session.service, validationMethod: data.qrToken ? 'qr_scan' : 'manual_code' },
  });
  return {
    id: meal.id,
    service: session.service,
    serviceName: ({ breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena' } as Record<string, string>)[session.service] ?? session.service,
    remainingBalance: Math.max(0, subscription.remainingDays - 1),
    timestamp: meal.date,
    restaurantName: subscription.restaurant.name,
    validationMethod: data.qrToken ? 'qr_scan' : 'manual_code',
  };
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
  } catch (_err) {
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
      restaurantId: subscription.restaurantId,
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
