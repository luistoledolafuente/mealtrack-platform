import * as repository from './audit.repository.js';

export async function list(filters: {
  entity?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: string;
  limit?: string;
}) {
  const queryFilters: {
    entity?: string;
    action?: string;
    from?: Date;
    to?: Date;
  } = {};

  if (filters.entity) queryFilters.entity = filters.entity;
  if (filters.action) queryFilters.action = filters.action;
  if (filters.from) queryFilters.from = new Date(filters.from);
  if (filters.to) queryFilters.to = new Date(filters.to);

  const page = parseInt(filters.page || '1', 10);
  const limit = Math.min(parseInt(filters.limit || '50', 10), 100);

  return repository.findMany(queryFilters, page, limit);
}

export async function create(data: {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  detail?: Record<string, unknown>;
  ipAddress?: string;
}) {
  return repository.create(data);
}
