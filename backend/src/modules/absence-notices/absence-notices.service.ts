import * as repository from './absence-notices.repository.js';
import * as subscriptionRepository from '../subscriptions/subscriptions.repository.js';
import { ApiError } from '../../shared/index.js';
import * as auditService from '../audit/audit.service.js';
import type { CreateAbsenceNoticeInput, ReviewAbsenceNoticeInput } from './absence-notices.schema.js';

type NoticeWithScope = {
  id: string;
  studentId: string;
  status: string;
  subscription: { restaurantId: string };
};

function localDay(value: string): Date {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export async function list(userId: string, role: string, restaurantId: string | null) {
  if (role === 'student') return repository.findByStudent(userId);
  if (role === 'admin' && restaurantId) return repository.findByRestaurant(restaurantId);
  if (role === 'superadmin') return repository.findAll();
  return [];
}

export async function create(
  data: CreateAbsenceNoticeInput,
  actorId: string,
  role: string,
  restaurantId: string | null,
) {
  const subscription = await subscriptionRepository.findById(data.subscriptionId);
  if (!subscription) throw new ApiError('Suscripción no encontrada', 404, 'SUBSCRIPTION_NOT_FOUND');

  if (role === 'student' && subscription.studentId !== actorId) {
    throw new ApiError('Suscripción no encontrada', 404, 'SUBSCRIPTION_NOT_FOUND');
  }
  if (role === 'admin' && subscription.restaurantId !== restaurantId) {
    throw new ApiError('Suscripción no encontrada', 404, 'SUBSCRIPTION_NOT_FOUND');
  }
  if (subscription.status !== 'active') {
    throw new ApiError('La suscripción no está activa', 409, 'SUBSCRIPTION_NOT_ACTIVE');
  }

  const date = localDay(data.date);
  const existing = await repository.findExisting(data.subscriptionId, date, data.service);
  if (existing) throw new ApiError('Ya existe un aviso para este servicio', 409, 'ABSENCE_NOTICE_EXISTS');

  const notice = await repository.create({
    subscriptionId: data.subscriptionId,
    studentId: subscription.studentId,
    date,
    service: data.service,
    reason: data.reason,
    createdById: actorId,
  });
  await auditService.record({
    actorId,
    action: 'CREATE_ABSENCE_NOTICE',
    entity: 'AbsenceNotice',
    entityId: (notice as { id: string }).id,
    restaurantId: subscription.restaurantId,
    correlationId: (notice as { id: string }).id,
    detail: { subscriptionId: data.subscriptionId, date: date.toISOString().slice(0, 10), service: data.service },
  });
  return notice;
}

export async function review(id: string, data: ReviewAbsenceNoticeInput, actorId: string, role: string, restaurantId: string | null) {
  const notice = await repository.findById(id) as NoticeWithScope | null;
  if (!notice) throw new ApiError('Aviso de ausencia no encontrado', 404, 'ABSENCE_NOTICE_NOT_FOUND');
  if (role !== 'superadmin' && notice.subscription.restaurantId !== restaurantId) {
    throw new ApiError('Aviso de ausencia no encontrado', 404, 'ABSENCE_NOTICE_NOT_FOUND');
  }

  const transition = await repository.reviewPending(id, actorId, data.decision, data.resolutionNotes);
  if (transition.count !== 1) throw new ApiError('El aviso ya fue revisado', 409, 'ABSENCE_NOTICE_ALREADY_REVIEWED');
  const updated = await repository.findById(id);
  await auditService.record({
    actorId,
    action: 'REVIEW_ABSENCE_NOTICE',
    entity: 'AbsenceNotice',
    entityId: id,
    restaurantId: notice.subscription.restaurantId,
    correlationId: id,
    detail: { decision: data.decision },
  });
  return updated;
}
