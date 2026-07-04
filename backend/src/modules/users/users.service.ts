import * as repository from './users.repository.js';
import { ApiError } from '../../shared/index.js';

export async function getProfile(userId: string) {
  const user = await repository.findById(userId);
  if (!user) {
    throw new ApiError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  }
  return user;
}

export async function updateProfile(userId: string, data: { fullName?: string }) {
  const user = await repository.findById(userId);
  if (!user) {
    throw new ApiError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  }
  return repository.update(userId, data);
}
