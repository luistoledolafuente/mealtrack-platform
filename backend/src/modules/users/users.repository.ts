import { prisma } from '../../config/database.js';

export async function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      restaurantId: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function update(id: string, data: { fullName?: string }) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      restaurantId: true,
      isActive: true,
      createdAt: true,
    },
  });
}
