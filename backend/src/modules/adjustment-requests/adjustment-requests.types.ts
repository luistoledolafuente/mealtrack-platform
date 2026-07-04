export interface AdjustmentRequestResponse {
  id: string;
  dailyMealId: string;
  requesterId: string;
  reason: string;
  status: string;
  reviewerId: string | null;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
}
