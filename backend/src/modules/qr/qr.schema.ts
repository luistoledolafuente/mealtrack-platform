import { z } from 'zod';

export const issueQrSchema = z.object({
  subscriptionId: z.string().uuid('ID de suscripción inválido'),
});

export const validateQrSchema = z.object({
  token: z.string().min(1, 'Token es obligatorio'),
});

export const createQrSessionSchema = z.object({
  service: z.enum(['breakfast', 'lunch', 'dinner']),
  expiresInSeconds: z.number().int().min(30).max(60).optional(),
});

export const scanQrSessionSchema = z.object({
  qrToken: z.string().min(1).optional(),
  manualCode: z.string().regex(/^\d{6}$/, 'El código debe tener 6 dígitos').optional(),
}).refine((value) => Boolean(value.qrToken) !== Boolean(value.manualCode), {
  message: 'Envía qrToken o manualCode, pero no ambos',
});

export type IssueQrInput = z.infer<typeof issueQrSchema>;
export type ValidateQrInput = z.infer<typeof validateQrSchema>;
export type CreateQrSessionInput = z.infer<typeof createQrSessionSchema>;
export type ScanQrSessionInput = z.infer<typeof scanQrSessionSchema>;
