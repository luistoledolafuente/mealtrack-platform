import { z } from 'zod';

const serviceSchema = z.enum(['breakfast', 'lunch', 'dinner']);

export const createAbsenceNoticeSchema = z.object({
  subscriptionId: z.string().uuid(),
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha inválida'),
  service: serviceSchema,
  reason: z.string().min(3).max(1000),
});

export const reviewAbsenceNoticeSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  resolutionNotes: z.string().max(1000).optional(),
});

export type CreateAbsenceNoticeInput = z.infer<typeof createAbsenceNoticeSchema>;
export type ReviewAbsenceNoticeInput = z.infer<typeof reviewAbsenceNoticeSchema>;
