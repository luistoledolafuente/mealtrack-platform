export interface AuditLogResponse {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  detail: unknown;
  ipAddress: string | null;
  createdAt: Date;
}
