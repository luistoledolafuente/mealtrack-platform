import { prisma } from '../../config/database.js';

export async function findAll() {
  return prisma.restaurant.findMany({ orderBy: { name: 'asc' } });
}

export async function findById(id: string) {
  return prisma.restaurant.findUnique({ where: { id } });
}

export async function create(data: { name: string; address?: string }) {
  return prisma.restaurant.create({ data });
}

export async function update(id: string, data: { name?: string; address?: string; isActive?: boolean }) {
  return prisma.restaurant.update({ where: { id }, data });
}
