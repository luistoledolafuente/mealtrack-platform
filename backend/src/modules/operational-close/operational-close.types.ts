export type CloseService = 'breakfast' | 'lunch' | 'dinner';

export interface CloseActor {
  id: string;
  role: string;
  restaurantId: string | null;
}

export interface RunCloseInput {
  restaurantId: string;
  date: string;
  service: CloseService;
  actor: CloseActor;
}

export type CloseOutcome =
  | 'skipped_existing'
  | 'skipped_inactive'
  | 'justified'
  | 'pending_review'
  | 'not_operational'
  | 'auto_consumed'
  | 'failed_insufficient_balance';

export interface SubscriptionCloseResult {
  subscriptionId: string;
  studentId: string;
  outcome: CloseOutcome;
  dailyMealId: string | null;
  debited: boolean;
  credited: boolean;
}

export interface OperationalCloseSummary {
  restaurantId: string;
  date: string;
  service: CloseService;
  timeZone: string | null;
  processed: number;
  counts: Record<CloseOutcome, number>;
  results: SubscriptionCloseResult[];
}
