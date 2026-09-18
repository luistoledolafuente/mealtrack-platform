import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.adjustmentRequest.deleteMany();
  await prisma.dailyMeal.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.user.deleteMany();
  await prisma.restaurant.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Superadmin (no restaurant)
  const superadmin = await prisma.user.create({
    data: {
      id: uuid(),
      fullName: 'Super Admin',
      email: 'superadmin@mealtrack.com',
      passwordHash,
      role: 'superadmin',
    },
  });

  // Restaurants
  const restaurant1 = await prisma.restaurant.create({
    data: {
      id: uuid(),
      name: 'Restaurante Universitario Central',
      address: 'Av. Universidad 123',
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      id: uuid(),
      name: 'Comedor Estudiantil Norte',
      address: 'Calle Los Estudiantes 456',
    },
  });

  // Admins
  const admin1 = await prisma.user.create({
    data: {
      id: uuid(),
      fullName: 'Admin Central',
      email: 'admin@central.com',
      passwordHash,
      role: 'admin',
      restaurantId: restaurant1.id,
    },
  });

  await prisma.user.create({
    data: {
      id: uuid(),
      fullName: 'Admin Norte',
      email: 'admin@norte.com',
      passwordHash,
      role: 'admin',
      restaurantId: restaurant2.id,
    },
  });

  // Students
  const student1 = await prisma.user.create({
    data: {
      id: uuid(),
      fullName: 'Luis Miguel Torres',
      email: 'luis@example.com',
      passwordHash,
      role: 'student',
      restaurantId: restaurant1.id,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      id: uuid(),
      fullName: 'María García López',
      email: 'maria@example.com',
      passwordHash,
      role: 'student',
      restaurantId: restaurant1.id,
    },
  });

  // Meal Plans
  const plan30 = await prisma.mealPlan.create({
    data: {
      id: uuid(),
      restaurantId: restaurant1.id,
      name: 'Plan Mensual 30 Días',
      price: 270.00,
      durationDays: 30,
      description: 'Almuerzos de lunes a viernes, 30 días al mes',
    },
  });

  await prisma.mealPlan.create({
    data: {
      id: uuid(),
      restaurantId: restaurant1.id,
      name: 'Plan Semanal 5 Días',
      price: 55.00,
      durationDays: 5,
      description: '5 almuerzos consecutivos',
    },
  });

  await prisma.mealPlan.create({
    data: {
      id: uuid(),
      restaurantId: restaurant2.id,
      name: 'Plan Mensual 20 Días',
      price: 180.00,
      durationDays: 20,
      description: '20 almuerzos para estudiantes',
    },
  });

  // Subscriptions
  const sub1 = await prisma.subscription.create({
    data: {
      id: uuid(),
      studentId: student1.id,
      mealPlanId: plan30.id,
      restaurantId: restaurant1.id,
      startDate: new Date('2026-07-01'),
      contractedDays: 30,
      remainingDays: 22,
      status: 'active',
    },
  });

  const sub2 = await prisma.subscription.create({
    data: {
      id: uuid(),
      studentId: student2.id,
      mealPlanId: plan30.id,
      restaurantId: restaurant1.id,
      startDate: new Date('2026-06-15'),
      contractedDays: 30,
      remainingDays: 5,
      status: 'active',
    },
  });

  // Daily Meals for Student 1
  await prisma.dailyMeal.create({
    data: {
      id: uuid(),
      subscriptionId: sub1.id,
      studentId: student1.id,
      date: new Date('2026-07-01'),
      status: 'consumed',
      registeredBy: admin1.id,
      validationMethod: 'QR',
    },
  });

  await prisma.dailyMeal.create({
    data: {
      id: uuid(),
      subscriptionId: sub1.id,
      studentId: student1.id,
      date: new Date('2026-07-02'),
      status: 'consumed',
      registeredBy: admin1.id,
      validationMethod: 'QR',
    },
  });

  const mealToAdjust = await prisma.dailyMeal.create({
    data: {
      id: uuid(),
      subscriptionId: sub1.id,
      studentId: student1.id,
      date: new Date('2026-07-03'),
      status: 'not_consumed',
      registeredBy: admin1.id,
      validationMethod: 'manual',
    },
  });

  // Payments
  await prisma.payment.create({
    data: {
      id: uuid(),
      subscriptionId: sub1.id,
      studentId: student1.id,
      restaurantId: restaurant1.id,
      amount: 270.00,
      paymentDate: new Date('2026-07-01'),
      paymentMethod: 'cash',
      registeredBy: admin1.id,
    },
  });

  await prisma.payment.create({
    data: {
      id: uuid(),
      subscriptionId: sub2.id,
      studentId: student2.id,
      restaurantId: restaurant1.id,
      amount: 270.00,
      paymentDate: new Date('2026-06-15'),
      paymentMethod: 'transfer',
      registeredBy: admin1.id,
    },
  });

  // Adjustment Requests
  await prisma.adjustmentRequest.create({
    data: {
      id: uuid(),
      dailyMealId: mealToAdjust.id,
      requesterId: student1.id,
      reason: 'Estuve enfermo y no pude asistir al comedor',
      status: 'pending',
    },
  });

  console.log('Seed completed successfully');
  console.log(`  - Users: ${await prisma.user.count()}`);
  console.log(`  - Restaurants: ${await prisma.restaurant.count()}`);
  console.log(`  - Meal Plans: ${await prisma.mealPlan.count()}`);
  console.log(`  - Subscriptions: ${await prisma.subscription.count()}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
