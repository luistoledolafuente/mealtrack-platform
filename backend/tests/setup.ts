import { vi } from 'vitest';

// Mock Prisma globally for tests
vi.mock('../src/config/database', () => ({
  prisma: {
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
    subscription: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    dailyMeal: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    adjustmentRequest: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    payment: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    notification: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    auditLog: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  },
}));
