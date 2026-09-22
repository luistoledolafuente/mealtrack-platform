import { prisma } from '../../config/database.js';

export async function findMany(filters: {
  entity?: string;
  action?: string;
  from?: Date;
  to?: Date;
  restaurantId?: string;
}, page = 1, limit = 50) {
  const where: Record<string, unknown> = {};

  if (filters.entity) where.entity = filters.entity;
  if (filters.action) where.action = filters.action;
  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) (where.createdAt as Record<string, unknown>).gte = filters.from;
    if (filters.to) (where.createdAt as Record<string, unknown>).lte = filters.to;
  }
  if (filters.restaurantId) {
    where.detail = { path: ['restaurantId'], equals: filters.restaurantId };
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where: where as any }),
  ]);

  return { logs, total, page, limit };
}

export async function create(data: {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  detail?: Record<string, unknown>;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({ data: data as any });
}
