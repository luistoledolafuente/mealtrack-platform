import { z } from 'zod';

export const createDailyMealSchema = z.object({
  subscriptionId: z.string().uuid(),
  mealDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Fecha inválida'),
  status: z.enum(['consumed', 'not_consumed', 'justified', 'pending']),
  validationSource: z.string().optional(),
});

export const queryDailyMealSchema = z.object({
  studentUserId: z.string().uuid().optional(),
  subscriptionId: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  status: z.enum(['consumed', 'not_consumed', 'justified', 'pending', 'adjusted']).optional(),
});

export type CreateDailyMealInput = z.infer<typeof createDailyMealSchema>;
export type QueryDailyMealInput = z.infer<typeof queryDailyMealSchema>;
