export interface PaymentResponse {
  id: string;
  subscriptionId: string;
  studentId: string;
  restaurantId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  reference: string | null;
  registeredBy: string;
  createdAt: Date;
}
