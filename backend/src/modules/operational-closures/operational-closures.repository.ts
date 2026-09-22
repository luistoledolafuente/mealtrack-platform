import { prisma } from '../../config/database.js';

type OperationalClosureDelegate = {
  findMany: (args: unknown) => Promise<unknown[]>;
  create: (args: unknown) => Promise<unknown>;
};

function delegate(): OperationalClosureDelegate {
  return (prisma as unknown as { operationalClosure: OperationalClosureDelegate }).operationalClosure;
}

export async function findByRestaurant(restaurantId: string) {
  return delegate().findMany({ where: { restaurantId }, orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }] });
}

export async function findAll() {
  return delegate().findMany({
    include: { restaurant: { select: { id: true, name: true } }, createdBy: { select: { id: true, fullName: true } } },
    orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function create(data: {
  restaurantId: string;
  startDate: Date;
  endDate: Date;
  services: string[];
  reason: string;
  createdById: string;
}) {
  return delegate().create({ data });
}
