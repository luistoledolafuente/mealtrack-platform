import * as repository from './restaurants.repository.js';
import { ApiError } from '../../shared/index.js';

export async function list() {
  return repository.findAll();
}

export async function getById(id: string) {
  const restaurant = await repository.findById(id);
  if (!restaurant) {
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
