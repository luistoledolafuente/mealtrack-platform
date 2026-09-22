import * as repository from './audit.repository.js';

export async function list(filters: {
  entity?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: string;
  limit?: string;
}, scope?: { role: string; restaurantId: string | null }) {
  const queryFilters: {
    entity?: string;
    action?: string;
    from?: Date;
    to?: Date;
    restaurantId?: string;
  } = {};

  if (filters.entity) queryFilters.entity = filters.entity;
  if (filters.action) queryFilters.action = filters.action;
  if (filters.from) queryFilters.from = new Date(filters.from);
  if (filters.to) queryFilters.to = new Date(filters.to);
  if (scope?.role === 'admin') {
    if (!scope.restaurantId) return { logs: [], total: 0, page: 1, limit: 50 };
    queryFilters.restaurantId = scope.restaurantId;
  }

  const page = parseInt(filters.page || '1', 10);
  const limit = Math.min(parseInt(filters.limit || '50', 10), 100);

  return repository.findMany(queryFilters, page, limit);
}

const SENSITIVE_KEY = /password|token|secret|authorization|cookie|manualcode|qrcode|codehash/i;

export type AuditEvent = {
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  restaurantId?: string | null;
  correlationId?: string;
  detail?: Record<string, unknown>;
  ipAddress?: string;
};

function sanitize(value: unknown, depth = 0): unknown {
  if (depth >= 4) return '[truncated]';
  if (typeof value === 'string') return value.slice(0, 512);
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => sanitize(item, depth + 1));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, SENSITIVE_KEY.test(key) ? '[redacted]' : sanitize(entry, depth + 1)]));
}

export async function create(data: {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  detail?: Record<string, unknown>;
  ipAddress?: string;
}) {
  return record({
    actorId: data.userId,
    action: data.action,
    entity: data.entity,
    entityId: data.entityId,
    detail: data.detail,
    ipAddress: data.ipAddress,
  });
}

export async function record(event: AuditEvent) {
  const detail = sanitize({
    ...event.detail,
    restaurantId: event.restaurantId ?? undefined,
    correlationId: event.correlationId ?? undefined,
  }) as Record<string, unknown>;
  return repository.create({
    userId: event.actorId,
    action: event.action,
    entity: event.entity,
    entityId: event.entityId,
    detail,
    ipAddress: event.ipAddress,
  });
}

export const sanitizeAuditDetail = sanitize;
