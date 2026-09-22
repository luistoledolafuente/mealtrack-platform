import * as repository from './operational-closures.repository.js';
import { ApiError } from '../../shared/index.js';
import * as auditService from '../audit/audit.service.js';
import type { CreateOperationalClosureInput } from './operational-closures.schema.js';

function localDay(value: string): Date {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export async function list(role: string, restaurantId: string | null) {
  if (role === 'superadmin') return repository.findAll();
  if (restaurantId) return repository.findByRestaurant(restaurantId);
  return [];
}

export async function create(data: CreateOperationalClosureInput, actorId: string, role: string, actorRestaurantId: string | null) {
  const restaurantId = role === 'superadmin' ? data.restaurantId : actorRestaurantId;
  if (!restaurantId) {
    throw new ApiError('Contexto de restaurante requerido', 400, 'TENANT_REQUIRED');
  }
  if (role === 'admin' && data.restaurantId && data.restaurantId !== actorRestaurantId) {
    throw new ApiError('No autorizado para operar en este restaurante', 403, 'FORBIDDEN');
  }

  const closure = await repository.create({
    restaurantId,
    startDate: localDay(data.startDate),
    endDate: localDay(data.endDate),
    services: [...new Set(data.services)],
    reason: data.reason,
    createdById: actorId,
  });
  await auditService.record({
    actorId,
    action: 'CREATE_OPERATIONAL_CLOSURE',
    entity: 'OperationalClosure',
    entityId: (closure as { id: string }).id,
    restaurantId,
    correlationId: (closure as { id: string }).id,
    detail: {
      startDate: data.startDate,
      endDate: data.endDate,
      services: [...new Set(data.services)],
    },
  });
  return closure;
}
