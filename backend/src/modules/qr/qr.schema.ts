import { z } from 'zod';

export const issueQrSchema = z.object({
  subscriptionId: z.string().uuid('ID de suscripción inválido'),
});

export const validateQrSchema = z.object({
  token: z.string().min(1, 'Token es obligatorio'),
});

export type IssueQrInput = z.infer<typeof issueQrSchema>;
export type ValidateQrInput = z.infer<typeof validateQrSchema>;
