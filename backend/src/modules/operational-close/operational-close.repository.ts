import { prisma } from '../../config/database.js';

type DbClient = typeof prisma;

type AbsenceNoticeDelegate = {
  findFirst: (args: unknown) => Promise<any | null>;
};

type OperationalClosureDelegate = {
  findMany: (args: unknown) => Promise<any[]>;
};

function absences(db: DbClient): AbsenceNoticeDelegate {
  return (db as unknown as { absenceNotice: AbsenceNoticeDelegate }).absenceNotice;
}

function closures(db: DbClient): OperationalClosureDelegate {
  return (db as unknown as { operationalClosure: OperationalClosureDelegate }).operationalClosure;
}

export async function findRestaurant(db: DbClient, id: string) {
  return db.restaurant.findUnique({ where: { id } });
}

export async function findActiveSubscriptions(db: DbClient, restaurantId: string) {
  return db.subscription.findMany({
    where: { restaurantId, status: 'active' },
    orderBy: { id: 'asc' },
  });
}

export async function findMealBySubscriptionAndDate(db: DbClient, subscriptionId: string, date: Date) {
  return db.dailyMeal.findFirst({ where: { subscriptionId, date } });
}

export async function findAbsenceNotice(db: DbClient, subscriptionId: string, date: Date, service: string) {
  return absences(db).findFirst({ where: { subscriptionId, date, service } });
}

export async function findCoveringClosure(db: DbClient, restaurantId: string, date: Date, service: string) {
  const closuresFound = await closures(db).findMany({
    where: {
      restaurantId,
      startDate: { lte: date },
      endDate: { gte: date },
      services: { has: service },
    },
    orderBy: { createdAt: 'asc' },
  });
  const list = closuresFound as Array<{ id: string; services: string[] }>;
  return list.find((closure) => closure.services.includes(service)) ?? null;
}

export async function findCreditAudit(
  db: DbClient,
  subscriptionId: string,
  closureId: string,
  dateStr: string,
  service: string,
) {
  const logs = await db.auditLog.findMany({
    where: { action: 'OPERATIONAL_CLOSE_CREDIT', entity: 'Subscription', entityId: subscriptionId },
  });
  return (logs as Array<{ detail: unknown }>).find((log) => {
    const detail = log.detail as { closureId?: string; date?: string; service?: string } | null;
    return detail?.closureId === closureId && detail?.date === dateStr && detail?.service === service;
  }) ?? null;
}
