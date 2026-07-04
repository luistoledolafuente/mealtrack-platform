export interface UserProfileResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  restaurantId: string | null;
  isActive: boolean;
  createdAt: Date;
}
