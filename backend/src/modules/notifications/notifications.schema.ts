import { z } from 'zod';
export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['expiration', 'payment', 'adjustment', 'system']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(500),
});
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
