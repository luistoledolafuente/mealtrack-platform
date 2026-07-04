export interface SubscriptionResponse {
  id: string;
  studentId: string;
  mealPlanId: string;
  restaurantId: string;
  startDate: Date;
  contractedDays: number;
  remainingDays: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  mealPlan?: {
    name: string;
    price: number;
  };
  student?: {
    id: string;
    fullName: string;
    email: string;
  };
}
