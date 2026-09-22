import { z } from 'zod';

export const scanConsumptionSchema = z.object({
  qrToken: z.string().min(1).optional(),
  manualCode: z.string().regex(/^\d{6}$/, 'El código debe tener 6 dígitos').optional(),
}).refine((value) => Boolean(value.qrToken) !== Boolean(value.manualCode), {
  message: 'Envía qrToken o manualCode, pero no ambos',
});

export type ScanConsumptionInput = z.infer<typeof scanConsumptionSchema>;
