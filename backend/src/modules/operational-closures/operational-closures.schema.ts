import { z } from 'zod';

const serviceSchema = z.enum(['breakfast', 'lunch', 'dinner']);

export const createOperationalClosureSchema = z.object({
  restaurantId: z.string().uuid().optional(),
  startDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha inicial inválida'),
  endDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha final inválida'),
  services: z.array(serviceSchema).min(1).max(3),
  reason: z.string().min(3).max(1000),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'La fecha final debe ser igual o posterior a la fecha inicial',
  path: ['endDate'],
});

export type CreateOperationalClosureInput = z.infer<typeof createOperationalClosureSchema>;
