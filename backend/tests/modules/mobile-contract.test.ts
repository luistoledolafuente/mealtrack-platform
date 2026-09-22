import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { prisma } from '../../src/config/database.js';
import app from '../../src/app.js';
import * as subscriptionsService from '../../src/modules/subscriptions/subscriptions.service.js';
import * as consumptionsService from '../../src/modules/consumptions/consumptions.service.js';
import * as qrService from '../../src/modules/qr/qr.service.js';
import { generateToken } from '../../src/shared/utils/crypto.js';

vi.mock('../../src/modules/qr/qr.service.js', () => ({
  scanRestaurantQrSession: vi.fn(),
}));

const studentId = '11111111-1111-1111-1111-111111111111';
const restaurantId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const studentToken = generateToken({ id: studentId, role: 'student', restaurantId });

const activeSubscription = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  studentId,
  restaurantId,
  status: 'active',
  startDate: new Date('2026-09-01T00:00:00.000Z'),
  contractedDays: 30,
  remainingDays: 20,
  mealPlan: { name: 'Plan mensual' },
  restaurant: { name: 'Restaurante piloto' },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('L-02 - contrato móvil de pensión', () => {
  it('publica el resumen en el endpoint autenticado del estudiante', async () => {
    (prisma.subscription.findFirst as any).mockResolvedValue(activeSubscription);
    (prisma.absenceNotice.findMany as any).mockResolvedValue([]);
    (prisma.operationalClosure.findMany as any).mockResolvedValue([]);

    const response = await request(app)
      .get('/api/v1/subscriptions/me/summary')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.serviceBalances[0].service).toBe('lunch');
  });

  it('expone solamente el saldo de almuerzo en el alcance MVP', async () => {
    (prisma.subscription.findFirst as any).mockResolvedValue(activeSubscription);
    (prisma.absenceNotice.findMany as any).mockResolvedValue([
      { id: 'notice-lunch', date: new Date('2026-09-02'), service: 'lunch', status: 'approved', reason: 'Trámite' },
      { id: 'notice-dinner', date: new Date('2026-09-02'), service: 'dinner', status: 'approved', reason: 'Fuera de MVP' },
    ]);
    (prisma.operationalClosure.findMany as any).mockResolvedValue([
      { id: 'closure-lunch', startDate: new Date('2026-09-10'), endDate: new Date('2026-09-10'), services: ['lunch'], reason: 'Mantenimiento' },
    ]);

    const result = await subscriptionsService.getMySummary(studentId, 'student', restaurantId);

    expect(result.serviceBalances).toEqual([{
      service: 'lunch', serviceName: 'Almuerzo', contractedCount: 30, remainingCount: 20, included: true,
    }]);
    expect(result.absences).toHaveLength(1);
    expect(result.usedAbsences).toBe(1);
    expect(result.closureAlerts).toHaveLength(1);
  });

  it('no expone el resumen a un usuario sin el tenant estudiantil', async () => {
    await expect(subscriptionsService.getMySummary(studentId, 'admin', restaurantId))
      .rejects.toMatchObject({ errorCode: 'FORBIDDEN' });
    await expect(subscriptionsService.getMySummary(studentId, 'student', null))
      .rejects.toMatchObject({ errorCode: 'FORBIDDEN' });
  });
});

describe('L-02 - consumo móvil', () => {
  it('publica el scan de almuerzo y exige Idempotency-Key', async () => {
    (qrService.scanRestaurantQrSession as any).mockResolvedValue({ id: 'meal-1', service: 'lunch' });

    const missingKey = await request(app)
      .post('/api/v1/consumptions/scan')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ manualCode: '123456' });
    expect(missingKey.status).toBe(400);
    expect(missingKey.body.error.code).toBe('IDEMPOTENCY_KEY_REQUIRED');

    const response = await request(app)
      .post('/api/v1/consumptions/scan')
      .set('Authorization', `Bearer ${studentToken}`)
      .set('Idempotency-Key', 'retry-safe-key')
      .send({ manualCode: '123456' });
    expect(response.status).toBe(200);
    expect(qrService.scanRestaurantQrSession).toHaveBeenCalledWith(
      { manualCode: '123456' }, studentId, 'retry-safe-key', 'lunch',
    );
  });

  it('exige una clave de idempotencia antes de consultar el QR', async () => {
    await expect(consumptionsService.scanLunch({ qrToken: 'valid-token' }, studentId, undefined))
      .rejects.toMatchObject({ errorCode: 'IDEMPOTENCY_KEY_REQUIRED' });
    expect(qrService.scanRestaurantQrSession).not.toHaveBeenCalled();
  });

  it('solo permite QR de almuerzo y propaga la clave de idempotencia', async () => {
    const expected = { id: 'meal-1', service: 'lunch', remainingBalance: 19 };
    (qrService.scanRestaurantQrSession as any).mockResolvedValue(expected);

    await expect(consumptionsService.scanLunch({ manualCode: '123456' }, studentId, 'key-1'))
      .resolves.toEqual(expected);
    expect(qrService.scanRestaurantQrSession).toHaveBeenCalledWith(
      { manualCode: '123456' }, studentId, 'key-1', 'lunch',
    );
  });
});
