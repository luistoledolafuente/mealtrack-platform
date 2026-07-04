import { prisma } from '../../config/database.js';

export async function findByRestaurant(restaurantId: string) {
  return prisma.mealPlan.findMany({
    where: { restaurantId },
    orderBy: { name: 'asc' },
  });
}

export async function findById(id: string) {
  return prisma.mealPlan.findUnique({ where: { id } });
}

export async function create(data: {
  restaurantId: string;
  name: string;
  price: number;
  durationDays: number;
  description?: string;
}) {
  return prisma.mealPlan.create({ data });
}

export async function update(id: string, data: {
  name?: string;
  price?: number;
  durationDays?: number;
  description?: string;
  isActive?: boolean;
}) {
  return prisma.mealPlan.update({ where: { id }, data });
}
