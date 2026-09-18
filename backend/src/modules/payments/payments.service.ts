import * as repository from './payments.repository.js';
import * as subscriptionRepository from '../subscriptions/subscriptions.repository.js';
import * as notificationRepository from '../notifications/notifications.repository.js';
import { ApiError } from '../../shared/index.js';

export async function list(userId: string, role: string, restaurantId: string | null) {
  if (role === 'student') {
    return repository.findByStudent(userId);
  }
  if (restaurantId) {
    return repository.findByRestaurant(restaurantId);
  }
  return [];
}

export async function getById(id: string) {
  const payment = await repository.findById(id);
  if (!payment) {
    throw new ApiError('Pago no encontrado', 404, 'PAYMENT_NOT_FOUND');
  }
  return payment;
}

export async function create(data: {
  subscriptionId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceCode?: string;
}, userId: string, restaurantId: string | null) {
  if (!restaurantId) {
    throw new ApiError('Contexto de restaurante requerido', 400, 'TENANT_REQUIRED');
  }

  const subscription = await subscriptionRepository.findById(data.subscriptionId);
  if (!subscription) {
    throw new ApiError('Suscripción no encontrada', 404, 'SUBSCRIPTION_NOT_FOUND');
  }

  if (subscription.restaurantId !== restaurantId) {
    throw new ApiError('La suscripción no pertenece al restaurante especificado', 403, 'FORBIDDEN');
  }

  const payment = await repository.create({
    subscriptionId: data.subscriptionId,
    studentId: subscription.studentId,
    restaurantId,
    amount: data.amount,
    paymentDate: new Date(data.paymentDate),
    paymentMethod: data.paymentMethod,
    reference: data.referenceCode,
    registeredBy: userId,
  });

  await notificationRepository.create({
    userId: subscription.studentId,
    type: 'payment',
    title: 'Pago registrado',
    message: `Se registró un pago de ${data.amount.toFixed(2)} para tu suscripción`,
  });

  return payment;
}
