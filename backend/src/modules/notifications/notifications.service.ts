import * as repository from './notifications.repository.js';
import { ApiError } from '../../shared/index.js';

export async function list(userId: string) {
  return repository.findByUser(userId);
}

export async function markAsRead(id: string, userId: string) {
  const notification = await repository.findById(id);
  if (!notification || notification.userId !== userId) {
    throw new ApiError('Notificación no encontrada', 404, 'NOTIFICATION_NOT_FOUND');
  }
  return repository.markAsRead(id);
}

export async function markAllAsRead(userId: string) {
  return repository.markAllAsRead(userId);
}
