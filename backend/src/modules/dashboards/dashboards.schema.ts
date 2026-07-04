import { z } from 'zod';
export const dateRangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
