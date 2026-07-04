import { z } from 'zod';

export const auditLogQuerySchema = z.object({
  entity: z.string().optional(),
  action: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type AuditLogQueryInput = z.infer<typeof auditLogQuerySchema>;
