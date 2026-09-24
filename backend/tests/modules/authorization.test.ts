import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { prisma } from '../../src/config/database.js';
import { generateToken } from '../../src/shared/utils/crypto.js';

const STUDENT_TOKEN = generateToken({ id: '11111111-1111-1111-1111-111111111111', role: 'student', restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' });
const _STUDENT2_TOKEN = generateToken({ id: '22222222-2222-2222-2222-222222222222', role: 'student', restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' });
const ADMIN_TOKEN = generateToken({ id: '33333333-3333-3333-3333-333333333333', role: 'admin', restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' });
const _ADMIN2_TOKEN = generateToken({ id: '44444444-4444-4444-4444-444444444444', role: 'admin', restaurantId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' });
const SUPERADMIN_TOKEN = generateToken({ id: '55555555-5555-5555-5555-555555555555', role: 'superadmin', restaurantId: null });
const ADMIN_WITHOUT_TENANT_TOKEN = generateToken({ id: '66666666-6666-6666-6666-666666666666', role: 'admin', restaurantId: null });

const mockDailyMeal = {
  id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
  studentId: '11111111-1111-1111-1111-111111111111',
  subscriptionId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  date: new Date('2024-01-15'),
  status: 'consumed',
  subscription: { restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
};

const mockSubscription = {
  id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  studentId: '11111111-1111-1111-1111-111111111111',
  restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  mealPlan: { name: 'Plan A', price: 100 },
  student: { id: '11111111-1111-1111-1111-111111111111', fullName: 'Student 1', email: 's1@test.com' },
  restaurant: { name: 'Restaurant 1' },
};

const mockPayment = {
  id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
  studentId: '11111111-1111-1111-1111-111111111111',
  restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  amount: 100,
  paymentDate: new Date(),
  paymentMethod: 'cash',
};

const mockMealPlan = {
  id: 'gggggggg-gggg-gggg-gggg-gggggggggggg',
  restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  name: 'Plan A',
  price: 100,
  durationDays: 30,
};

const mockRestaurant = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  name: 'Restaurant 1',
  address: 'Address 1',
};

const mockAdjustmentRequest = {
  id: 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  dailyMealId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
  requesterId: '11111111-1111-1111-1111-111111111111',
  reason: 'Test reason',
  dailyMeal: {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    studentId: '11111111-1111-1111-1111-111111111111',
    subscription: { restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
  },
};

function resetMocks() {
  vi.clearAllMocks();
}

describe('Authorization - Daily Meals', () => {
  beforeEach(resetMocks);

  it('estudiante propio = 200', async () => {
    (prisma.dailyMeal.findUnique as any).mockResolvedValue(mockDailyMeal);
    const res = await request(app)
      .get('/api/v1/daily-meals/dddddddd-dddd-dddd-dddd-dddddddddddd')
      .set('Authorization', `Bearer ${STUDENT_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('estudiante ajeno = 404', async () => {
    (prisma.dailyMeal.findUnique as any).mockResolvedValue({ ...mockDailyMeal, studentId: '22222222-2222-2222-2222-222222222222' });
    const res = await request(app)
      .get('/api/v1/daily-meals/dddddddd-dddd-dddd-dddd-dddddddddddd')
      .set('Authorization', `Bearer ${STUDENT_TOKEN}`);
    expect(res.status).toBe(404);
  });

  it('admin propio = 200', async () => {
    (prisma.dailyMeal.findUnique as any).mockResolvedValue(mockDailyMeal);
    const res = await request(app)
      .get('/api/v1/daily-meals/dddddddd-dddd-dddd-dddd-dddddddddddd')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('admin de otro restaurante = 404', async () => {
    (prisma.dailyMeal.findUnique as any).mockResolvedValue({ ...mockDailyMeal, subscription: { restaurantId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' } });
    const res = await request(app)
      .get('/api/v1/daily-meals/dddddddd-dddd-dddd-dddd-dddddddddddd')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(404);
  });

  it('superadmin = 200', async () => {
    (prisma.dailyMeal.findUnique as any).mockResolvedValue(mockDailyMeal);
    const res = await request(app)
      .get('/api/v1/daily-meals/dddddddd-dddd-dddd-dddd-dddddddddddd')
      .set('Authorization', `Bearer ${SUPERADMIN_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('listados no mezclan restaurantes - admin solo ve los suyos', async () => {
    (prisma.dailyMeal.findMany as any).mockResolvedValue([mockDailyMeal]);
    const res = await request(app)
      .get('/api/v1/daily-meals')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(200);
    expect(prisma.dailyMeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          subscription: { restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
        }),
      })
    );
  });

  it('x-tenant-id no puede cambiar el contexto del token', async () => {
    (prisma.dailyMeal.findMany as any).mockResolvedValue([mockDailyMeal]);
    const res = await request(app)
      .get('/api/v1/daily-meals')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .set('x-tenant-id', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    expect(res.status).toBe(200);
    expect(prisma.dailyMeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          subscription: { restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
        }),
      })
    );
  });

  it('admin sin restaurante es rechazado aunque envíe x-tenant-id', async () => {
    const res = await request(app)
      .get('/api/v1/daily-meals')
      .set('Authorization', `Bearer ${ADMIN_WITHOUT_TENANT_TOKEN}`)
      .set('x-tenant-id', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('TENANT_CONTEXT_REQUIRED');
  });
});

describe('Authorization - Subscriptions', () => {
  beforeEach(resetMocks);

  it('estudiante propio = 200', async () => {
    (prisma.subscription.findUnique as any).mockResolvedValue(mockSubscription);
    const res = await request(app)
      .get('/api/v1/subscriptions/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee')
      .set('Authorization', `Bearer ${STUDENT_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('estudiante ajeno = 404', async () => {
    (prisma.subscription.findUnique as any).mockResolvedValue({ ...mockSubscription, studentId: '22222222-2222-2222-2222-222222222222' });
    const res = await request(app)
      .get('/api/v1/subscriptions/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee')
      .set('Authorization', `Bearer ${STUDENT_TOKEN}`);
    expect(res.status).toBe(404);
  });

  it('admin propio = 200', async () => {
    (prisma.subscription.findUnique as any).mockResolvedValue(mockSubscription);
    const res = await request(app)
      .get('/api/v1/subscriptions/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('admin de otro restaurante = 404', async () => {
    (prisma.subscription.findUnique as any).mockResolvedValue({ ...mockSubscription, restaurantId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' });
    const res = await request(app)
      .get('/api/v1/subscriptions/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(404);
  });

  it('superadmin = 200', async () => {
    (prisma.subscription.findUnique as any).mockResolvedValue(mockSubscription);
    const res = await request(app)
      .get('/api/v1/subscriptions/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee')
      .set('Authorization', `Bearer ${SUPERADMIN_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('listados no mezclan restaurantes', async () => {
    (prisma.subscription.findMany as any).mockResolvedValue([mockSubscription]);
    const res = await request(app)
      .get('/api/v1/subscriptions')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(200);
    expect(prisma.subscription.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
      })
    );
  });
});

describe('Authorization - Payments', () => {
  beforeEach(resetMocks);

  it('estudiante propio = 200', async () => {
    (prisma.payment.findUnique as any).mockResolvedValue(mockPayment);
    const res = await request(app)
      .get('/api/v1/payments/ffffffff-ffff-ffff-ffff-ffffffffffff')
      .set('Authorization', `Bearer ${STUDENT_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('estudiante ajeno = 404', async () => {
    (prisma.payment.findUnique as any).mockResolvedValue({ ...mockPayment, studentId: '22222222-2222-2222-2222-222222222222' });
    const res = await request(app)
      .get('/api/v1/payments/ffffffff-ffff-ffff-ffff-ffffffffffff')
      .set('Authorization', `Bearer ${STUDENT_TOKEN}`);
    expect(res.status).toBe(404);
  });

  it('admin propio = 200', async () => {
    (prisma.payment.findUnique as any).mockResolvedValue(mockPayment);
    const res = await request(app)
      .get('/api/v1/payments/ffffffff-ffff-ffff-ffff-ffffffffffff')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('admin de otro restaurante = 404', async () => {
    (prisma.payment.findUnique as any).mockResolvedValue({ ...mockPayment, restaurantId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' });
    const res = await request(app)
      .get('/api/v1/payments/ffffffff-ffff-ffff-ffff-ffffffffffff')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(404);
  });

  it('superadmin = 200', async () => {
    (prisma.payment.findUnique as any).mockResolvedValue(mockPayment);
    const res = await request(app)
      .get('/api/v1/payments/ffffffff-ffff-ffff-ffff-ffffffffffff')
      .set('Authorization', `Bearer ${SUPERADMIN_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('listados no mezclan restaurantes', async () => {
    (prisma.payment.findMany as any).mockResolvedValue([mockPayment]);
    const res = await request(app)
      .get('/api/v1/payments')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(200);
    expect(prisma.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
      })
    );
  });
});

describe('Authorization - Meal Plans', () => {
  beforeEach(resetMocks);

  it('admin propio = 200', async () => {
    (prisma.mealPlan.findUnique as any).mockResolvedValue(mockMealPlan);
    const res = await request(app)
      .get('/api/v1/meal-plans/gggggggg-gggg-gggg-gggg-gggggggggggg')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('admin de otro restaurante = 404', async () => {
    (prisma.mealPlan.findUnique as any).mockResolvedValue({ ...mockMealPlan, restaurantId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' });
    const res = await request(app)
      .get('/api/v1/meal-plans/gggggggg-gggg-gggg-gggg-gggggggggggg')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(404);
  });

  it('superadmin = 200', async () => {
    (prisma.mealPlan.findUnique as any).mockResolvedValue(mockMealPlan);
    const res = await request(app)
      .get('/api/v1/meal-plans/gggggggg-gggg-gggg-gggg-gggggggggggg')
      .set('Authorization', `Bearer ${SUPERADMIN_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('estudiante = 404 (no access to meal plans)', async () => {
    (prisma.mealPlan.findUnique as any).mockResolvedValue(mockMealPlan);
    const res = await request(app)
      .get('/api/v1/meal-plans/gggggggg-gggg-gggg-gggg-gggggggggggg')
      .set('Authorization', `Bearer ${STUDENT_TOKEN}`);
    expect(res.status).toBe(404);
  });

  it('superadmin no puede seleccionar un tenant con x-tenant-id y debe indicar el restaurante en el contrato', async () => {
    const res = await request(app)
      .get('/api/v1/meal-plans')
      .set('Authorization', `Bearer ${SUPERADMIN_TOKEN}`)
      .set('x-tenant-id', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('RESTAURANT_REQUIRED');
    expect(prisma.mealPlan.findMany).not.toHaveBeenCalled();
  });

  it('superadmin consulta planes de un restaurante solo con restaurantId explícito', async () => {
    (prisma.mealPlan.findMany as any).mockResolvedValue([mockMealPlan]);
    const restaurantId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const res = await request(app)
      .get(`/api/v1/meal-plans?restaurantId=${restaurantId}`)
      .set('Authorization', `Bearer ${SUPERADMIN_TOKEN}`);
    expect(res.status).toBe(200);
    expect(prisma.mealPlan.findMany).toHaveBeenCalledWith({ where: { restaurantId }, orderBy: { name: 'asc' } });
  });
});

describe('Authorization - Adjustment Requests', () => {
  beforeEach(resetMocks);

  it('estudiante no puede crear ajuste sobre consumo ajeno = 404', async () => {
    (prisma.dailyMeal.findUnique as any).mockResolvedValue({ ...mockDailyMeal, studentId: '22222222-2222-2222-2222-222222222222' });
    const res = await request(app)
      .post('/api/v1/adjustment-requests')
      .set('Authorization', `Bearer ${STUDENT_TOKEN}`)
      .send({ dailyMealId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', reason: 'Test' });
    expect(res.status).toBe(404);
  });

  it('estudiante puede crear ajuste sobre su propio consumo = 201', async () => {
    (prisma.dailyMeal.findUnique as any).mockResolvedValue(mockDailyMeal);
    (prisma.subscription.findUnique as any).mockResolvedValue(mockSubscription);
    (prisma.adjustmentRequest.create as any).mockResolvedValue(mockAdjustmentRequest);
    const res = await request(app)
      .post('/api/v1/adjustment-requests')
      .set('Authorization', `Bearer ${STUDENT_TOKEN}`)
      .send({ dailyMealId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', reason: 'Test' });
    expect(res.status).toBe(201);
  });

  it('admin del mismo restaurante = 201', async () => {
    (prisma.dailyMeal.findUnique as any).mockResolvedValue(mockDailyMeal);
    (prisma.subscription.findUnique as any).mockResolvedValue(mockSubscription);
    (prisma.adjustmentRequest.create as any).mockResolvedValue(mockAdjustmentRequest);
    const res = await request(app)
      .post('/api/v1/adjustment-requests')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ dailyMealId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', reason: 'Test' });
    expect(res.status).toBe(201);
  });

  it('admin de otro restaurante = 404', async () => {
    (prisma.dailyMeal.findUnique as any).mockResolvedValue({ ...mockDailyMeal, subscription: { restaurantId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' } });
    (prisma.subscription.findUnique as any).mockResolvedValue({ ...mockSubscription, restaurantId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' });
    const res = await request(app)
      .post('/api/v1/adjustment-requests')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ dailyMealId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', reason: 'Test' });
    expect(res.status).toBe(404);
  });

  it('superadmin = 201', async () => {
    (prisma.dailyMeal.findUnique as any).mockResolvedValue(mockDailyMeal);
    (prisma.subscription.findUnique as any).mockResolvedValue(mockSubscription);
    (prisma.adjustmentRequest.create as any).mockResolvedValue(mockAdjustmentRequest);
    const res = await request(app)
      .post('/api/v1/adjustment-requests')
      .set('Authorization', `Bearer ${SUPERADMIN_TOKEN}`)
      .send({ dailyMealId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', reason: 'Test' });
    expect(res.status).toBe(201);
  });
});

describe('Authorization - Restaurants', () => {
  beforeEach(resetMocks);

  it('estudiante solo ve su restaurante = 200', async () => {
    (prisma.restaurant.findUnique as any).mockResolvedValue(mockRestaurant);
    const res = await request(app)
      .get('/api/v1/restaurants/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
      .set('Authorization', `Bearer ${STUDENT_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('estudiante no ve otro restaurante = 404', async () => {
    (prisma.restaurant.findUnique as any).mockResolvedValue({ ...mockRestaurant, id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' });
    const res = await request(app)
      .get('/api/v1/restaurants/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
      .set('Authorization', `Bearer ${STUDENT_TOKEN}`);
    expect(res.status).toBe(404);
  });

  it('admin solo ve su restaurante = 200', async () => {
    (prisma.restaurant.findUnique as any).mockResolvedValue(mockRestaurant);
    const res = await request(app)
      .get('/api/v1/restaurants/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('admin no ve otro restaurante = 404', async () => {
    (prisma.restaurant.findUnique as any).mockResolvedValue({ ...mockRestaurant, id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' });
    const res = await request(app)
      .get('/api/v1/restaurants/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(404);
  });

  it('superadmin ve todos = 200', async () => {
    (prisma.restaurant.findUnique as any).mockResolvedValue({ ...mockRestaurant, id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' });
    const res = await request(app)
      .get('/api/v1/restaurants/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
      .set('Authorization', `Bearer ${SUPERADMIN_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('listado estudiante/admin solo incluye su restaurante', async () => {
    (prisma.restaurant.findUnique as any).mockResolvedValue(mockRestaurant);
    const res = await request(app)
      .get('/api/v1/restaurants')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(200);
    expect(prisma.restaurant.findMany).not.toHaveBeenCalled();
    expect(prisma.restaurant.findUnique).toHaveBeenCalledWith({ where: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } });
  });

  it('listado superadmin incluye todos', async () => {
    (prisma.restaurant.findMany as any).mockResolvedValue([mockRestaurant, { ...mockRestaurant, id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' }]);
    const res = await request(app)
      .get('/api/v1/restaurants')
      .set('Authorization', `Bearer ${SUPERADMIN_TOKEN}`);
    expect(res.status).toBe(200);
    expect(prisma.restaurant.findMany).toHaveBeenCalled();
  });
});
