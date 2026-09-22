import { z } from 'zod';

export const operationalCloseServiceSchema = z.enum(['breakfast', 'lunch', 'dinner']);

export const operationalCloseSchema = z.object({
  restaurantId: z.string().uuid('ID de restaurante inválido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida, use YYYY-MM-DD'),
  service: operationalCloseServiceSchema,
  actor: z.object({
    id: z.string().uuid('ID de actor inválido'),
    role: z.string(),
    restaurantId: z.string().uuid().nullable(),
  }),
});

export type OperationalCloseInput = z.infer<typeof operationalCloseSchema>;
export type OperationalCloseService = z.infer<typeof operationalCloseServiceSchema>;
