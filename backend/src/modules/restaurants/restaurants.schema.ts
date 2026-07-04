import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().max(300).optional(),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().max(300).optional(),
  isActive: z.boolean().optional(),
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
