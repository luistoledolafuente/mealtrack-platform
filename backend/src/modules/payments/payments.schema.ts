import { z } from 'zod';

export const createPaymentSchema = z.object({
  subscriptionId: z.string().uuid(),
  amount: z.number().positive(),
  paymentDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Fecha inválida'),
  paymentMethod: z.enum(['cash', 'transfer', 'card', 'other']),
  referenceCode: z.string().max(100).optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
