import { prisma } from '../../config/database.js';
import { ApiError } from '../../shared/index.js';
import { operationalCloseSchema } from './operational-close.schema.js';
import type {
  CloseOutcome,
  CloseService,
  OperationalCloseSummary,
  RunCloseInput,
  SubscriptionCloseResult,
} from './operational-close.types.js';
import * as repository from './operational-close.repository.js';

const SUPPORTED_SERVICES: ReadonlySet<string> = new Set(['breakfast', 'lunch', 'dinner']);
const ALLOWED_ROLES: ReadonlySet<string> = new Set(['admin', 'superadmin']);

export function parseOperationalDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError('Fecha inválida, use YYYY-MM-DD', 400, 'INVALID_DATE');
  }
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  const [year, month, day] = value.split('-').map(Number);
  if (
    Number.isNaN(date.getTime())
    || date.getUTCFullYear() !== year
    || date.getUTCMonth() + 1 !== month
    || date.getUTCDate() !== day
  ) {
    throw new ApiError('Fecha inválida, use YYYY-MM-DD', 400, 'INVALID_DATE');
  }
  return date;
}

export function getOperationalDateString(timeZone: string, now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
  } catch {
    throw new ApiError('Zona horaria inválida', 400, 'INVALID_TIMEZONE');
  }
}

export function getRestaurantTimeZone(restaurant: { config?: unknown } | null): string | null {
  const timezone = (restaurant?.config as { timezone?: unknown } | null)?.timezone;
  return typeof timezone === 'string' && timezone.length > 0 ? timezone : null;
}

export function closeIdempotencyKey(subscriptionId: string, dateStr: string, service: CloseService): string {
  return `oc:${subscriptionId}:${dateStr}:${service}`;
}

function creditIdempotencyKey(subscriptionId: string, closureId: string, dateStr: string, service: CloseService): string {
  return `occ:${subscriptionId}:${closureId}:${dateStr}:${service}`;
}

function emptyCounts(): Record<CloseOutcome, number> {
  return {
    skipped_existing: 0,
    skipped_inactive: 0,
    justified: 0,
    pending_review: 0,
    not_operational: 0,
    auto_consumed: 0,
    failed_insufficient_balance: 0,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string })?.code === 'P2002';
}

export async function runOperationalClose(rawInput: RunCloseInput): Promise<OperationalCloseSummary> {
  const input = operationalCloseSchema.parse(rawInput);
  const { restaurantId, date: dateStr, service, actor } = input;

  if (!ALLOWED_ROLES.has(actor.role)) {
    throw new ApiError('No autorizado para ejecutar el cierre operativo', 403, 'FORBIDDEN');
  }
  if (actor.role === 'admin' && actor.restaurantId !== restaurantId) {
    throw new ApiError('No autorizado para operar en este restaurante', 403, 'FORBIDDEN');
  }
  if (!SUPPORTED_SERVICES.has(service)) {
    throw new ApiError('Servicio no soportado', 400, 'INVALID_SERVICE');
  }

  const date = parseOperationalDate(dateStr);
  const restaurant = await repository.findRestaurant(prisma, restaurantId);
  if (!restaurant) {
    throw new ApiError('Restaurante no encontrado', 404, 'RESTAURANT_NOT_FOUND');
  }
  if (!restaurant.isActive) {
    throw new ApiError('El restaurante no está activo', 409, 'RESTAURANT_NOT_ACTIVE');
  }

  const timeZone = getRestaurantTimeZone(restaurant);
  const subscriptions = await repository.findActiveSubscriptions(prisma, restaurantId);

  const results: SubscriptionCloseResult[] = [];
  const counts = emptyCounts();

  for (const subscription of subscriptions as Array<{ id: string; studentId: string; status: string }>) {
    const result = await closeSubscription(
      subscription,
      { restaurantId, date, dateStr, service: service as CloseService, actorId: actor.id },
    );
    results.push(result);
    counts[result.outcome] += 1;
  }

  return {
    restaurantId,
    date: dateStr,
    service: service as CloseService,
    timeZone,
    processed: results.length,
    counts,
    results,
  };
}

async function closeSubscription(
  subscription: { id: string; studentId: string; status: string },
  context: { restaurantId: string; date: Date; dateStr: string; service: CloseService; actorId: string },
): Promise<SubscriptionCloseResult> {
  const base = { subscriptionId: subscription.id, studentId: subscription.studentId };
  try {
    return await prisma.$transaction(async (tx) => {
      const db = tx as unknown as typeof prisma;
      const current = await db.subscription.findUnique({ where: { id: subscription.id } });
      if (!current || (current as { status: string }).status !== 'active') {
        return { ...base, outcome: 'skipped_inactive', dailyMealId: null, debited: false, credited: false };
      }

      const existing = await repository.findMealBySubscriptionAndDate(db, subscription.id, context.date);
      if (existing) {
        return {
          ...base,
          outcome: 'skipped_existing',
          dailyMealId: (existing as { id: string }).id,
          debited: false,
          credited: false,
        };
      }

      const closure = await repository.findCoveringClosure(db, context.restaurantId, context.date, context.service);
      if (closure) {
        return closeForExtraordinaryClosure(db, subscription, context, closure as { id: string });
      }

      const notice = await repository.findAbsenceNotice(db, subscription.id, context.date, context.service);
      const status = (notice as { status: string } | null)?.status ?? null;
      if (status === 'approved') {
        return recordWithoutDebit(db, subscription, context, 'justified');
      }
      if (status === 'pending') {
        return recordWithoutDebit(db, subscription, context, 'pending_review', 'pending');
      }

      const debit = await db.subscription.updateMany({
        where: { id: subscription.id, status: 'active', remainingDays: { gt: 0 } },
        data: { remainingDays: { decrement: 1 } },
      });
      if (debit.count !== 1) {
        return { ...base, outcome: 'failed_insufficient_balance', dailyMealId: null, debited: false, credited: false };
      }

      const meal = await db.dailyMeal.create({
        data: {
          subscriptionId: subscription.id,
          studentId: subscription.studentId,
          date: context.date,
          status: 'consumed',
          registeredBy: context.actorId,
          validationMethod: 'OPERATIONAL_CLOSE',
          idempotencyKey: closeIdempotencyKey(subscription.id, context.dateStr, context.service),
        },
      });
      await writeCloseAudit(db, context, (meal as { id: string }).id, 'auto_consumed');
      await writeNotification(db, subscription.studentId, context, 'auto_consumed');
      return { ...base, outcome: 'auto_consumed', dailyMealId: (meal as { id: string }).id, debited: true, credited: false };
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      const existing = await repository.findMealBySubscriptionAndDate(prisma, subscription.id, context.date);
      return {
        ...base,
        outcome: 'skipped_existing',
        dailyMealId: existing ? (existing as { id: string }).id : null,
        debited: false,
        credited: false,
      };
    }
    throw error;
  }
}

async function recordWithoutDebit(
  db: typeof prisma,
  subscription: { id: string; studentId: string },
  context: { restaurantId: string; date: Date; dateStr: string; service: CloseService; actorId: string },
  outcome: CloseOutcome,
  mealStatus?: string,
): Promise<SubscriptionCloseResult> {
  const status = mealStatus ?? (outcome === 'justified' ? 'justified' : 'pending');
  const meal = await db.dailyMeal.create({
    data: {
      subscriptionId: subscription.id,
      studentId: subscription.studentId,
      date: context.date,
      status,
      registeredBy: context.actorId,
      validationMethod: 'OPERATIONAL_CLOSE',
      idempotencyKey: closeIdempotencyKey(subscription.id, context.dateStr, context.service),
    },
  });
  await writeCloseAudit(db, context, (meal as { id: string }).id, outcome);
  await writeNotification(db, subscription.studentId, context, outcome);
  return {
    subscriptionId: subscription.id,
    studentId: subscription.studentId,
    outcome,
    dailyMealId: (meal as { id: string }).id,
    debited: false,
    credited: false,
  };
}

async function closeForExtraordinaryClosure(
  db: typeof prisma,
  subscription: { id: string; studentId: string },
  context: { restaurantId: string; date: Date; dateStr: string; service: CloseService; actorId: string },
  closure: { id: string },
): Promise<SubscriptionCloseResult> {
  const meal = await db.dailyMeal.create({
    data: {
      subscriptionId: subscription.id,
      studentId: subscription.studentId,
      date: context.date,
      status: 'not_operational',
      registeredBy: context.actorId,
      validationMethod: 'OPERATIONAL_CLOSE',
      idempotencyKey: closeIdempotencyKey(subscription.id, context.dateStr, context.service),
    },
  });

  let credited = false;
  const existingCredit = await repository.findCreditAudit(db, subscription.id, closure.id, context.dateStr, context.service);
  if (!existingCredit) {
    await db.subscription.update({
      where: { id: subscription.id },
      data: { remainingDays: { increment: 1 } },
    });
    await db.auditLog.create({
      data: {
        userId: context.actorId,
        action: 'OPERATIONAL_CLOSE_CREDIT',
        entity: 'Subscription',
        entityId: subscription.id,
        detail: {
          restaurantId: context.restaurantId,
          closureId: closure.id,
          date: context.dateStr,
          service: context.service,
          idempotencyKey: creditIdempotencyKey(subscription.id, closure.id, context.dateStr, context.service),
        },
      },
    });
    credited = true;
  }

  await writeCloseAudit(db, context, (meal as { id: string }).id, 'not_operational');
  await writeNotification(db, subscription.studentId, context, 'not_operational');
  return {
    subscriptionId: subscription.id,
    studentId: subscription.studentId,
    outcome: 'not_operational',
    dailyMealId: (meal as { id: string }).id,
    debited: false,
    credited,
  };
}

async function writeCloseAudit(
  db: typeof prisma,
  context: { restaurantId: string; dateStr: string; service: CloseService; actorId: string },
  dailyMealId: string,
  outcome: CloseOutcome,
): Promise<void> {
  await db.auditLog.create({
    data: {
      userId: context.actorId,
      action: 'OPERATIONAL_CLOSE',
      entity: 'DailyMeal',
      entityId: dailyMealId,
      detail: {
        restaurantId: context.restaurantId,
        date: context.dateStr,
        service: context.service,
        outcome,
        actorId: context.actorId,
      },
    },
  });
}

async function writeNotification(
  db: typeof prisma,
  studentId: string,
  context: { dateStr: string; service: CloseService },
  outcome: CloseOutcome,
): Promise<void> {
  const messages: Record<CloseOutcome, string> = {
    skipped_existing: '',
    skipped_inactive: '',
    justified: `Tu ausencia del ${context.dateStr} (${context.service}) fue registrada como justificada, sin descuento de saldo.`,
    pending_review: `Tu aviso del ${context.dateStr} (${context.service}) quedó pendiente de revisión, sin descuento por ahora.`,
    not_operational: `El restaurante estuvo cerrado el ${context.dateStr} (${context.service}); no se descontó saldo y se extendió tu vigencia.`,
    auto_consumed: `No se registró asistencia ni aviso el ${context.dateStr} (${context.service}); se descontó un día de tu saldo.`,
    failed_insufficient_balance: '',
  };
  const message = messages[outcome];
  if (!message) return;
  await db.notification.create({
    data: {
      userId: studentId,
      type: 'system',
      title: 'Cierre operativo',
      message,
    },
  });
}
