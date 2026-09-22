import { vi } from 'vitest';

// Mock Prisma globally for tests
vi.mock('../src/config/database', () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    restaurant: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    mealPlan: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    subscription: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    dailyMeal: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    adjustmentRequest: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
    payment: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    notification: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    auditLog: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    qrSession: { findFirst: vi.fn(), create: vi.fn() },
    absenceNotice: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
    operationalClosure: { findMany: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };
  prisma.$transaction.mockImplementation(async (callback: (client: typeof prisma) => unknown) => callback(prisma));
  return { prisma };
});
