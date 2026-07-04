import { prisma } from '../../config/database.js';

export async function getActiveSubscription(studentId: string) {
  return prisma.subscription.findFirst({
    where: { studentId, status: 'active' },
    include: { mealPlan: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTodayMeal(studentId: string) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start.getTime() + 86400000);

  return prisma.dailyMeal.findFirst({
    where: {
      studentId,
      date: { gte: start, lt: end },
    },
  });
}

export async function getRecentMeals(studentId: string, limit = 5) {
  return prisma.dailyMeal.findMany({
    where: { studentId },
    orderBy: { date: 'desc' },
    take: limit,
  });
}

export async function countStudentsByRestaurant(restaurantId: string) {
  return prisma.user.count({ where: { restaurantId, role: 'student', isActive: true } });
}

export async function countTodayConsumed(restaurantId: string) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start.getTime() + 86400000);

  return prisma.dailyMeal.count({
    where: {
      status: 'consumed',
      subscription: { restaurantId },
      date: { gte: start, lt: end },
    },
  });
}

export async function countPendingAdjustments(restaurantId: string) {
  return prisma.adjustmentRequest.count({
    where: {
      status: 'pending',
      dailyMeal: { subscription: { restaurantId } },
    },
  });
}
