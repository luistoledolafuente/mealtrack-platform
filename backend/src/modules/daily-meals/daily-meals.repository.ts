import { prisma } from '../../config/database.js';

export async function findMany(filters: {
  studentId?: string;
  subscriptionId?: string;
  from?: Date;
  to?: Date;
  status?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters.studentId) where.studentId = filters.studentId;
  if (filters.subscriptionId) where.subscriptionId = filters.subscriptionId;
  if (filters.status) where.status = filters.status;
  if (filters.from || filters.to) {
    where.date = {};
    if (filters.from) (where.date as Record<string, unknown>).gte = filters.from;
    if (filters.to) (where.date as Record<string, unknown>).lte = filters.to;
  }

  return prisma.dailyMeal.findMany({
    where: where as any,
    orderBy: { date: 'desc' },
  });
}

export async function findById(id: string) {
  return prisma.dailyMeal.findUnique({ where: { id } });
}

export async function findBySubscriptionAndDate(subscriptionId: string, studentId: string, date: Date) {
  return prisma.dailyMeal.findFirst({
    where: { subscriptionId, studentId, date },
  });
}

export async function create(data: {
  subscriptionId: string;
  studentId: string;
  date: Date;
  status: string;
  registeredBy: string;
  validationMethod?: string;
}) {
  return prisma.dailyMeal.create({ data });
}

export async function updateStatus(id: string, status: string) {
  return prisma.dailyMeal.update({ where: { id }, data: { status } });
}

export async function countByDateRange(restaurantId: string, from: Date, to: Date, status?: string) {
  const where: Record<string, unknown> = {
    subscription: { restaurantId },
    date: { gte: from, lte: to },
  };
  if (status) where.status = status;

  return prisma.dailyMeal.count({ where: where as any });
}
