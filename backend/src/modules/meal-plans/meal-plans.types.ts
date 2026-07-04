export interface MealPlanResponse {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  durationDays: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
