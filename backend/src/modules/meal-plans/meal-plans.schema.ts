import { z } from 'zod';

export const createMealPlanSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  durationDays: z.number().int().positive(),
  description: z.string().max(500).optional(),
});

export const updateMealPlanSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  price: z.number().positive().optional(),
  durationDays: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export type CreateMealPlanInput = z.infer<typeof createMealPlanSchema>;
export type UpdateMealPlanInput = z.infer<typeof updateMealPlanSchema>;
