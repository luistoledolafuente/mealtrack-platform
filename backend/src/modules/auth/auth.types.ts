export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  restaurantId: string | null;
  isActive: boolean;
  createdAt: Date;
}
