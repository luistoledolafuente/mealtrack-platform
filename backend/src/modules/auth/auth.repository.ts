import { prisma } from '../../config/database.js';

export async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      fullName: true,
      email: true,
      passwordHash: true,
      role: true,
      restaurantId: true,
      isActive: true,
    },
  });
}

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
