import type { Request } from 'express';
import { ApiError } from '../errors/ApiError.js';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function resolveTargetRestaurantId(req: Request, value: unknown): string {
  const requestedId = typeof value === 'string' ? value : undefined;

  if (req.user?.role === 'superadmin') {
    if (!requestedId || !uuidPattern.test(requestedId)) {
      throw new ApiError('Selecciona un restaurante válido', 400, 'RESTAURANT_REQUIRED');
    }
    return requestedId;
  }

  if (!req.tenantId) {
    throw new ApiError('Contexto de restaurante requerido', 403, 'TENANT_CONTEXT_REQUIRED');
  }
  if (requestedId && requestedId !== req.tenantId) {
    throw new ApiError('No puedes operar otro restaurante', 403, 'FORBIDDEN');
  }
  return req.tenantId;
}
