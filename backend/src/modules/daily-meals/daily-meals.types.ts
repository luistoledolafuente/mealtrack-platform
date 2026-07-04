export interface DailyMealResponse {
  id: string;
  subscriptionId: string;
  studentId: string;
  date: Date;
  status: string;
  registeredBy: string;
  validationMethod: string | null;
  syncStatus: string;
  createdAt: Date;
  updatedAt: Date;
}
