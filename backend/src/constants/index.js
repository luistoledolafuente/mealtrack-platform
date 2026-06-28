// TODO: Move to database enums once schema is defined

const ROLES = Object.freeze({
  STUDENT: 'student',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
});

const SUBSCRIPTION_STATUS = Object.freeze({
  ACTIVE: 'active',
  EXPIRED: 'expired',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  FINISHED: 'finished',
});

const DAILY_MEAL_STATUS = Object.freeze({
  CONSUMED: 'consumed',
  NOT_CONSUMED: 'not_consumed',
  JUSTIFIED: 'justified',
  PENDING: 'pending',
  ADJUSTED: 'adjusted',
});

const ADJUSTMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

const SYNC_STATUS = Object.freeze({
  PENDING: 'pending',
  SYNCED: 'synced',
  REJECTED: 'rejected',
  ERROR: 'error',
});

const PAYMENT_METHOD = Object.freeze({
  CASH: 'cash',
  TRANSFER: 'transfer',
  CARD: 'card',
  OTHER: 'other',
});

const NOTIFICATION_TYPE = Object.freeze({
  EXPIRATION: 'expiration',
  PAYMENT: 'payment',
  ADJUSTMENT: 'adjustment',
  SYSTEM: 'system',
});

module.exports = {
  ROLES,
  SUBSCRIPTION_STATUS,
  DAILY_MEAL_STATUS,
  ADJUSTMENT_STATUS,
  SYNC_STATUS,
  PAYMENT_METHOD,
  NOTIFICATION_TYPE,
};
