import { z } from 'zod';

export const createAdjustmentSchema = z.object({
  dailyMealId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  requestedStatus: z.string().optional(),
});

export const reviewAdjustmentSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  resolutionNotes: z.string().max(500).optional(),
});

export type CreateAdjustmentInput = z.infer<typeof createAdjustmentSchema>;
export type ReviewAdjustmentInput = z.infer<typeof reviewAdjustmentSchema>;
