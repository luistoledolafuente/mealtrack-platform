import { prisma } from '../../config/database.js';

export async function findByStudent(studentId: string) {
  return prisma.subscription.findMany({
    where: { studentId },
    include: {
      mealPlan: { select: { name: true, price: true } },
      restaurant: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findByRestaurant(restaurantId: string) {
  return prisma.subscription.findMany({
    where: { restaurantId },
    include: {
      mealPlan: { select: { name: true, price: true } },
      student: { select: { id: true, fullName: true, email: true } },
      restaurant: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findById(id: string) {
  return prisma.subscription.findUnique({
    where: { id },
    include: {
      mealPlan: { select: { name: true, price: true } },
      student: { select: { id: true, fullName: true, email: true } },
      restaurant: { select: { name: true } },
    },
  });
}

export async function create(data: {
  studentId: string;
  mealPlanId: string;
  restaurantId: string;
  startDate: Date;
  contractedDays: number;
  remainingDays: number;
}) {
  return prisma.subscription.create({ data });
}

export async function update(id: string, data: {
  status?: string;
  remainingDays?: number;
}) {
  return prisma.subscription.update({ where: { id }, data });
}

export async function findActiveByStudent(studentId: string) {
  return prisma.subscription.findFirst({
    where: { studentId, status: 'active' },
    include: {
      mealPlan: { select: { name: true, price: true } },
      restaurant: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function countByRestaurant(restaurantId: string) {
  return prisma.subscription.count({ where: { restaurantId } });
}

export async function countActiveByRestaurant(restaurantId: string) {
  return prisma.subscription.count({ where: { restaurantId, status: 'active' } });
}
