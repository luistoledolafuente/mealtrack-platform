import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/config/database.js', () => {
  const prisma: any = {
    restaurant: { findUnique: vi.fn() },
    subscription: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    dailyMeal: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    absenceNotice: { findFirst: vi.fn() },
    operationalClosure: { findMany: vi.fn() },
    notification: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    auditLog: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };
  prisma.$transaction.mockImplementation(async (callback: any) => callback(prisma));
  return { prisma };
});

import { prisma } from '../../src/config/database.js';
import {
  closeIdempotencyKey,
  getOperationalDateString,
  parseOperationalDate,
  runOperationalClose,
} from '../../src/modules/operational-close/operational-close.service.js';

const RESTAURANT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const OTHER_RESTAURANT_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const SUBSCRIPTION_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const STUDENT_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const ACTOR_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const DATE_STR = '2026-09-20';

const restaurant = {
  id: RESTAURANT_ID,
  isActive: true,
  config: { timezone: 'America/Lima' },
};

const subscription = {
  id: SUBSCRIPTION_ID,
  studentId: STUDENT_ID,
  restaurantId: RESTAURANT_ID,
  status: 'active',
  remainingDays: 5,
};

const adminActor = { id: ACTOR_ID, role: 'admin', restaurantId: RESTAURANT_ID };

function mockAbsence(value: unknown) {
  ((prisma as any).absenceNotice.findFirst as any).mockResolvedValue(value);
}

function mockClosures(value: unknown[]) {
  ((prisma as any).operationalClosure.findMany as any).mockResolvedValue(value);
}

beforeEach(() => {
  vi.clearAllMocks();
  (prisma.restaurant.findUnique as any).mockResolvedValue(restaurant);
  (prisma.subscription.findMany as any).mockResolvedValue([subscription]);
  (prisma.subscription.findUnique as any).mockResolvedValue(subscription);
  (prisma.dailyMeal.findFirst as any).mockResolvedValue(null);
  (prisma.dailyMeal.findUnique as any).mockResolvedValue(null);
  (prisma.subscription.updateMany as any).mockResolvedValue({ count: 1 });
  (prisma.dailyMeal.create as any).mockImplementation(async (args: any) => ({ id: 'meal-1', ...args.data }));
  (prisma.subscription.update as any).mockImplementation(async (args: any) => ({ id: SUBSCRIPTION_ID, ...args.data }));
  (prisma.auditLog.findMany as any).mockResolvedValue([]);
  (prisma.auditLog.create as any).mockImplementation(async (args: any) => ({ id: 'audit-1', ...args.data }));
  (prisma.notification.create as any).mockImplementation(async (args: any) => ({ id: 'notif-1', ...args.data }));
  mockAbsence(null);
  mockClosures([]);
});

describe('operational-close - consumo existente', () => {
  it('no hace nada si existe consumo QR/manual', async () => {
    (prisma.dailyMeal.findFirst as any).mockResolvedValue({ id: 'meal-qr', status: 'consumed' });

    const summary = await runOperationalClose({
      restaurantId: RESTAURANT_ID,
      date: DATE_STR,
      service: 'lunch',
      actor: adminActor,
    });

    expect(summary.counts.skipped_existing).toBe(1);
    expect(prisma.dailyMeal.create).not.toHaveBeenCalled();
    expect(prisma.subscription.updateMany).not.toHaveBeenCalled();
    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });
});

describe('operational-close - ausencia aprobada', () => {
  it('registra justificado sin descontar', async () => {
    mockAbsence({ id: 'notice-1', status: 'approved' });

    const summary = await runOperationalClose({
      restaurantId: RESTAURANT_ID,
      date: DATE_STR,
      service: 'lunch',
      actor: adminActor,
    });

    expect(summary.counts.justified).toBe(1);
    expect(prisma.dailyMeal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'justified',
          idempotencyKey: closeIdempotencyKey(SUBSCRIPTION_ID, DATE_STR, 'lunch'),
        }),
      }),
    );
    expect(prisma.subscription.updateMany).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalledOnce();
  });
});

describe('operational-close - ausencia pendiente', () => {
  it('registra pendiente sin descontar', async () => {
    mockAbsence({ id: 'notice-2', status: 'pending' });

    const summary = await runOperationalClose({
      restaurantId: RESTAURANT_ID,
      date: DATE_STR,
      service: 'dinner',
      actor: adminActor,
    });

    expect(summary.counts.pending_review).toBe(1);
    expect(prisma.dailyMeal.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'pending' }) }),
    );
    expect(prisma.subscription.updateMany).not.toHaveBeenCalled();
  });
});

describe('operational-close - cierre extraordinario', () => {
  it('no descuenta y acredita una sola vez aunque se reintente', async () => {
    mockClosures([{ id: 'closure-1', services: ['lunch'] }]);

    const first = await runOperationalClose({
      restaurantId: RESTAURANT_ID,
      date: DATE_STR,
      service: 'lunch',
      actor: adminActor,
    });

    expect(first.counts.not_operational).toBe(1);
    expect(prisma.subscription.updateMany).not.toHaveBeenCalled();
    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { remainingDays: { increment: 1 } } }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledTimes(2);

    (prisma.dailyMeal.findFirst as any).mockResolvedValue({ id: 'meal-closure', status: 'not_operational' });
    vi.clearAllMocks();
    mockClosures([{ id: 'closure-1', services: ['lunch'] }]);

    const second = await runOperationalClose({
      restaurantId: RESTAURANT_ID,
      date: DATE_STR,
      service: 'lunch',
      actor: adminActor,
    });

    expect(second.counts.skipped_existing).toBe(1);
    expect(prisma.dailyMeal.create).not.toHaveBeenCalled();
    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
  });

  it('no acredita dos veces si ya existe el crédito auditado', async () => {
    mockClosures([{ id: 'closure-9', services: ['dinner'] }]);
    (prisma.auditLog.findMany as any).mockResolvedValue([
      { detail: { closureId: 'closure-9', date: DATE_STR, service: 'dinner' } },
    ]);

    const summary = await runOperationalClose({
      restaurantId: RESTAURANT_ID,
      date: DATE_STR,
      service: 'dinner',
      actor: adminActor,
    });

    expect(summary.counts.not_operational).toBe(1);
    expect(summary.results[0].credited).toBe(false);
    expect(prisma.subscription.update).not.toHaveBeenCalled();
  });
});

describe('operational-close - inasistencia sin aviso', () => {
  it('registra consumo automático y descuenta solo ese servicio', async () => {
    const summary = await runOperationalClose({
      restaurantId: RESTAURANT_ID,
      date: DATE_STR,
      service: 'breakfast',
      actor: adminActor,
    });

    expect(summary.counts.auto_consumed).toBe(1);
    expect(prisma.subscription.updateMany).toHaveBeenCalledWith({
      where: { id: SUBSCRIPTION_ID, status: 'active', remainingDays: { gt: 0 } },
      data: { remainingDays: { decrement: 1 } },
    });
    expect(prisma.dailyMeal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'consumed',
          validationMethod: 'OPERATIONAL_CLOSE',
          idempotencyKey: closeIdempotencyKey(SUBSCRIPTION_ID, DATE_STR, 'breakfast'),
        }),
      }),
    );
    expect(summary.results[0].debited).toBe(true);
  });

  it('no crea consumo si no hay saldo', async () => {
    (prisma.subscription.updateMany as any).mockResolvedValue({ count: 0 });

    const summary = await runOperationalClose({
      restaurantId: RESTAURANT_ID,
      date: DATE_STR,
      service: 'breakfast',
      actor: adminActor,
    });

    expect(summary.counts.failed_insufficient_balance).toBe(1);
    expect(prisma.dailyMeal.create).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
  });
});

describe('operational-close - idempotencia', () => {
  it('una violación de unicidad se trata como ya procesado', async () => {
    (prisma.dailyMeal.create as any).mockRejectedValueOnce({ code: 'P2002' });
    (prisma.dailyMeal.findFirst as any)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'meal-race', status: 'consumed' });

    const summary = await runOperationalClose({
      restaurantId: RESTAURANT_ID,
      date: DATE_STR,
      service: 'lunch',
      actor: adminActor,
    });

    expect(summary.counts.skipped_existing).toBe(1);
    expect(summary.results[0].dailyMealId).toBe('meal-race');
  });

  it('nunca edita ni borra consumos históricos', async () => {
    await runOperationalClose({
      restaurantId: RESTAURANT_ID,
      date: DATE_STR,
      service: 'lunch',
      actor: adminActor,
    });

    expect(prisma.dailyMeal.update).not.toHaveBeenCalled();
    expect((prisma.dailyMeal as any).delete).toBeUndefined();
  });

  it('todo cambio sensible corre dentro de una transacción', async () => {
    await runOperationalClose({
      restaurantId: RESTAURANT_ID,
      date: DATE_STR,
      service: 'lunch',
      actor: adminActor,
    });

    expect(prisma.$transaction).toHaveBeenCalled();
  });
});

describe('operational-close - tenant y zona horaria', () => {
  it('un admin nunca cierra datos de otro restaurante', async () => {
    await expect(
      runOperationalClose({
        restaurantId: RESTAURANT_ID,
        date: DATE_STR,
        service: 'lunch',
        actor: { id: ACTOR_ID, role: 'admin', restaurantId: OTHER_RESTAURANT_ID },
      }),
    ).rejects.toMatchObject({ errorCode: 'FORBIDDEN' });

    expect(prisma.subscription.findMany).not.toHaveBeenCalled();
    expect(prisma.dailyMeal.create).not.toHaveBeenCalled();
  });

  it('usa la zona horaria del restaurante y no la del teléfono', () => {
    const fixed = new Date('2026-09-20T04:00:00.000Z');
    expect(getOperationalDateString('America/Lima', fixed)).toBe('2026-09-19');
    expect(getOperationalDateString('UTC', fixed)).toBe('2026-09-20');
  });

  it('rechaza fechas inválidas', () => {
    expect(() => parseOperationalDate('2026-13-40')).toThrow();
    expect(() => parseOperationalDate('20-09-2026')).toThrow();
  });
});
