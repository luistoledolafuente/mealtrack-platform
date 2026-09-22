import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/config/database.js', () => ({
  prisma: {
    auditLog: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
  },
}));

import { prisma } from '../../src/config/database.js';
import { record, sanitizeAuditDetail } from '../../src/modules/audit/audit.service.js';

describe('audit log', () => {
  it('redacts credentials before an append-only write', async () => {
    (prisma.auditLog.create as any).mockResolvedValue({ id: 'audit-1' });

    await record({
      actorId: 'actor-1',
      action: 'SCAN_QR_CONSUMPTION',
      entity: 'DailyMeal',
      entityId: 'meal-1',
      restaurantId: 'restaurant-1',
      correlationId: 'request-1',
      detail: { qrToken: 'never-store-this', nested: { password: 'secret' } },
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        detail: expect.objectContaining({
          qrToken: '[redacted]',
          restaurantId: 'restaurant-1',
          correlationId: 'request-1',
          nested: { password: '[redacted]' },
        }),
      }),
    }));
  });

  it('bounds nested audit details', () => {
    expect(sanitizeAuditDetail({ a: { b: { c: { d: { e: 'value' } } } } })).toEqual({
      a: { b: { c: { d: '[truncated]' } } },
    });
  });
});
