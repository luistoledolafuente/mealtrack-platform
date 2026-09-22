import { prisma } from '../../config/database.js';

type AbsenceNoticeDelegate = {
  findMany: (args: unknown) => Promise<unknown[]>;
  findFirst: (args: unknown) => Promise<unknown | null>;
  findUnique: (args: unknown) => Promise<unknown | null>;
  create: (args: unknown) => Promise<unknown>;
  updateMany: (args: unknown) => Promise<{ count: number }>;
};

function delegate(): AbsenceNoticeDelegate {
  return (prisma as unknown as { absenceNotice: AbsenceNoticeDelegate }).absenceNotice;
}

export async function findByStudent(studentId: string) {
  return delegate().findMany({ where: { studentId }, orderBy: { createdAt: 'desc' } });
}

export async function findBySubscription(subscriptionId: string) {
  return delegate().findMany({ where: { subscriptionId }, orderBy: { createdAt: 'desc' } });
}

export async function findByRestaurant(restaurantId: string) {
  return delegate().findMany({
    where: { subscription: { restaurantId } },
    include: { student: { select: { id: true, fullName: true, email: true } }, subscription: { select: { id: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findAll() {
  return delegate().findMany({
    include: { student: { select: { id: true, fullName: true, email: true } }, subscription: { select: { id: true, restaurantId: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findExisting(subscriptionId: string, date: Date, service: string) {
  return delegate().findFirst({ where: { subscriptionId, date, service } });
}

export async function findById(id: string) {
  return delegate().findUnique({
    where: { id },
    include: { subscription: { select: { restaurantId: true } } },
  });
}

export async function create(data: {
  subscriptionId: string;
  studentId: string;
  date: Date;
  service: string;
  reason: string;
  createdById: string;
}) {
  return delegate().create({ data });
}

export async function reviewPending(id: string, reviewerId: string, status: string, resolution?: string) {
  return delegate().updateMany({
    where: { id, status: 'pending' },
    data: { status, reviewerId, resolution },
  });
}
