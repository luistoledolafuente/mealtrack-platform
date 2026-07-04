import { prisma } from '../../config/database.js';

export async function findByStudent(studentId: string) {
  return prisma.payment.findMany({
    where: { studentId },
    orderBy: { paymentDate: 'desc' },
  });
}

export async function findByRestaurant(restaurantId: string) {
  return prisma.payment.findMany({
    where: { restaurantId },
    orderBy: { paymentDate: 'desc' },
  });
}

export async function findById(id: string) {
  return prisma.payment.findUnique({ where: { id } });
}

export async function create(data: {
  subscriptionId: string;
  studentId: string;
  restaurantId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  reference?: string;
  registeredBy: string;
}) {
  return prisma.payment.create({ data });
}
