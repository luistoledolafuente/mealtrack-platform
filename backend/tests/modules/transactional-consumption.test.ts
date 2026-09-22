import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../../src/config/database.js';
import * as dailyMealsService from '../../src/modules/daily-meals/daily-meals.service.js';
import * as adjustmentService from '../../src/modules/adjustment-requests/adjustment-requests.service.js';

const studentId = '11111111-1111-1111-1111-111111111111';
const adminId = '22222222-2222-2222-2222-222222222222';
const restaurantId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const subscriptionId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const subscription = {
  id: subscriptionId,
  studentId,
  restaurantId,
  status: 'active',
  remainingDays: 3,
  student: { id: studentId },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('S0-03 - consumo transaccional', () => {
  it('debita saldo y crea el consumo dentro de una transacción', async () => {
    (prisma.dailyMeal.findUnique as any).mockResolvedValue(null);
    (prisma.dailyMeal.findFirst as any).mockResolvedValue(null);
    (prisma.subscription.findUnique as any).mockResolvedValue(subscription);
    (prisma.subscription.updateMany as any).mockResolvedValue({ count: 1 });
    (prisma.dailyMeal.create as any).mockResolvedValue({ id: 'meal-1', subscriptionId, studentId, status: 'consumed' });

    const result = await dailyMealsService.create({
      subscriptionId,
      mealDate: '2026-09-20T00:00:00.000Z',
      status: 'consumed',
      idempotencyKey: 'consumption-transaction-001',
    }, adminId, 'admin', restaurantId);

    expect(result.id).toBe('meal-1');
    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(prisma.subscription.updateMany).toHaveBeenCalledWith({
      where: { id: subscriptionId, status: 'active', remainingDays: { gt: 0 } },
      data: { remainingDays: { decrement: 1 } },
    });
    expect(prisma.dailyMeal.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ idempotencyKey: 'consumption-transaction-001' }),
    }));
  });

  it('devuelve el resultado original para una clave de idempotencia repetida', async () => {
    const existing = {
      id: 'meal-existing',
      subscriptionId,
      studentId,
      date: new Date('2026-09-20T00:00:00.000Z'),
      status: 'consumed',
    };
    (prisma.dailyMeal.findUnique as any).mockResolvedValue(existing);

    const result = await dailyMealsService.create({
      subscriptionId,
      mealDate: '2026-09-20T00:00:00.000Z',
      status: 'consumed',
      idempotencyKey: 'consumption-transaction-002',
    }, adminId, 'admin', restaurantId);

    expect(result).toBe(existing);
    expect(prisma.subscription.updateMany).not.toHaveBeenCalled();
    expect(prisma.dailyMeal.create).not.toHaveBeenCalled();
  });

  it('no crea consumo si el débito condicional no encuentra saldo', async () => {
    (prisma.dailyMeal.findUnique as any).mockResolvedValue(null);
    (prisma.dailyMeal.findFirst as any).mockResolvedValue(null);
    (prisma.subscription.findUnique as any).mockResolvedValue(subscription);
    (prisma.subscription.updateMany as any).mockResolvedValue({ count: 0 });

    await expect(dailyMealsService.create({
      subscriptionId,
      mealDate: '2026-09-20T00:00:00.000Z',
      status: 'consumed',
    }, adminId, 'admin', restaurantId)).rejects.toMatchObject({ errorCode: 'SUBSCRIPTION_INSUFFICIENT_BALANCE' });

    expect(prisma.dailyMeal.create).not.toHaveBeenCalled();
  });
});

describe('S0-03 - revisión única de ajustes', () => {
  it('rechaza una segunda revisión sin devolver saldo ni cambiar el consumo', async () => {
    (prisma.adjustmentRequest.findUnique as any).mockResolvedValue({
      id: 'adjustment-1',
      dailyMealId: 'meal-1',
      requesterId: studentId,
      status: 'approved',
      dailyMeal: { id: 'meal-1', subscriptionId, status: 'consumed', subscription: { restaurantId } },
    });
    (prisma.adjustmentRequest.updateMany as any).mockResolvedValue({ count: 0 });

    await expect(adjustmentService.review(
      'adjustment-1',
      { decision: 'approved' },
      adminId,
      'admin',
      restaurantId,
    )).rejects.toMatchObject({ errorCode: 'ADJUSTMENT_ALREADY_REVIEWED' });

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.dailyMeal.update).not.toHaveBeenCalled();
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });
});
