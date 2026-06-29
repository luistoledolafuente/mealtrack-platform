export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  FINISHED: 'finished',
} as const;

export const DAILY_MEAL_STATUS = {
  CONSUMED: 'consumed',
  NOT_CONSUMED: 'not_consumed',
  JUSTIFIED: 'justified',
  PENDING: 'pending',
  ADJUSTED: 'adjusted',
} as const;

export const ADJUSTMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCED: 'synced',
  REJECTED: 'rejected',
  ERROR: 'error',
} as const;

export const PAYMENT_METHOD = {
  CASH: 'cash',
  TRANSFER: 'transfer',
  CARD: 'card',
  OTHER: 'other',
} as const;

export const NOTIFICATION_TYPE = {
  EXPIRATION: 'expiration',
  PAYMENT: 'payment',
  ADJUSTMENT: 'adjustment',
  SYSTEM: 'system',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];
export type DailyMealStatus = (typeof DAILY_MEAL_STATUS)[keyof typeof DAILY_MEAL_STATUS];
export type AdjustmentStatus = (typeof ADJUSTMENT_STATUS)[keyof typeof ADJUSTMENT_STATUS];
export type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS];
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
