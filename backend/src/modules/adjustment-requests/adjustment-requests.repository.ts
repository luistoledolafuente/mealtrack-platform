import { prisma } from '../../config/database.js';

export async function findByRequester(requesterId: string) {
  return prisma.adjustmentRequest.findMany({
    where: { requesterId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findByDailyMealInRestaurant(restaurantId: string) {
  return prisma.adjustmentRequest.findMany({
    where: { dailyMeal: { subscription: { restaurantId } } },
    include: {
      dailyMeal: { select: { date: true, status: true } },
      requester: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findById(id: string) {
  return prisma.adjustmentRequest.findUnique({ where: { id } });
}

export async function create(data: {
  dailyMealId: string;
  requesterId: string;
  reason: string;
}) {
  return prisma.adjustmentRequest.create({ data });
}

export async function review(id: string, data: {
  status: string;
  reviewerId: string;
  resolution?: string;
}) {
  return prisma.adjustmentRequest.update({
    where: { id },
    data: {
      status: data.status,
      reviewerId: data.reviewerId,
      resolution: data.resolution,
    },
  });
}
