import * as repository from './meal-plans.repository.js';
import { ApiError } from '../../shared/index.js';

export async function list(restaurantId: string) {
  return repository.findByRestaurant(restaurantId);
}

export async function getById(id: string) {
  const plan = await repository.findById(id);
  if (!plan) {
    throw new ApiError('Plan de comida no encontrado', 404, 'MEAL_PLAN_NOT_FOUND');
  }
  return plan;
}

export async function create(data: {
  restaurantId: string;
  name: string;
  price: number;
  durationDays: number;
  description?: string;
}) {
  return repository.create(data);
}

export async function update(id: string, data: {
  name?: string;
  price?: number;
  durationDays?: number;
  description?: string;
  isActive?: boolean;
}, userRole: string, userRestaurantId: string | null) {
  const plan = await getById(id);
  if (userRole !== 'superadmin' && plan.restaurantId !== userRestaurantId) {
    throw new ApiError('No autorizado para operar en este plan', 403, 'FORBIDDEN');
  }
  return repository.update(id, data);
}
