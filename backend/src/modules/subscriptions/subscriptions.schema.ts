import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  studentUserId: z.string().uuid(),
  mealPlanId: z.string().uuid(),
  startDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Fecha inválida'),
});

export const updateSubscriptionSchema = z.object({
  status: z.enum(['active', 'expired', 'paused', 'cancelled', 'finished']).optional(),
  remainingDays: z.number().int().min(0).optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
