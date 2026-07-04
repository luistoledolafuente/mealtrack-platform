import { prisma } from '../../config/database.js';

export async function findByUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findById(id: string) {
  return prisma.notification.findUnique({ where: { id } });
}

export async function create(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
}) {
  return prisma.notification.create({ data });
}

export async function markAsRead(id: string) {
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function countUnread(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}
