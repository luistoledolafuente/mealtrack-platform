export interface StudentDashboardResponse {
  activeSubscription: {
    id: string;
    mealPlanName: string;
    contractedDays: number;
    remainingDays: number;
    startDate: Date;
  } | null;
  todayMeal: {
    id: string;
    date: Date;
    status: string;
  } | null;
  pendingNotifications: number;
  recentMeals: Array<{
    id: string;
    date: Date;
    status: string;
  }>;
}

export interface AdminDashboardResponse {
  totalStudents: number;
  todayConsumed: number;
  pendingAdjustments: number;
  activeSubscriptions: number;
}
