import { prisma } from '../../config/database.js';

export async function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      restaurantId: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
    },
  });
}

export async function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function create(data: {
  fullName: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  role: string;
  restaurantId?: string | null;
  mustChangePassword: boolean;
}) {
  return prisma.user.create({
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      restaurantId: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
    },
  });
}

export async function update(id: string, data: { fullName?: string; phone?: string | null }) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      restaurantId: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
    },
  });
}

export async function updatePassword(id: string, passwordHash: string) {
  return prisma.user.update({
    where: { id },
    data: { passwordHash, mustChangePassword: false },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      restaurantId: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
    },
  });
}

export async function findByIdWithPassword(id: string) {
  return prisma.user.findUnique({ where: { id } });
}