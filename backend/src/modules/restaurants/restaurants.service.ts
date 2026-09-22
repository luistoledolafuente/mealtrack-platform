import * as repository from './restaurants.repository.js';
import { ApiError } from '../../shared/index.js';

export async function list(role: string, restaurantId: string | null) {
  if (role === 'superadmin') return repository.findAll();
  if (!restaurantId) return [];
  const restaurant = await repository.findById(restaurantId);
  return restaurant ? [restaurant] : [];
}

export async function getById(id: string, role?: string, restaurantId?: string | null) {
  const restaurant = await repository.findById(id);
  if (!restaurant) {
    throw new ApiError('Restaurante no encontrado', 404, 'RESTAURANT_NOT_FOUND');
  }
  if (role !== 'superadmin' && restaurant.id !== restaurantId) {
    throw new ApiError('Restaurante no encontrado', 404, 'RESTAURANT_NOT_FOUND');
  }
  return restaurant;
}

export async function create(data: { name: string; address?: string }) {
  return repository.create(data);
}

export async function update(id: string, data: { name?: string; address?: string; isActive?: boolean }) {
  await getById(id);
  return repository.update(id, data);
}
