export interface RestaurantResponse {
  id: string;
  name: string;
  address: string | null;
  isActive: boolean;
  config: unknown;
  createdAt: Date;
  updatedAt: Date;
}
