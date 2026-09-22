import * as repository from './auth.repository.js';
import { comparePassword, generateToken, ApiError } from '../../shared/index.js';
import { resetLoginRateLimit } from '../../shared/utils/rateLimiter.js';

export async function login(email: string, password: string, clientIp: string) {
  const user = await repository.findByEmail(email);
  if (!user) {
    throw new ApiError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new ApiError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatch = await comparePassword(password, user.passwordHash);
  if (!passwordMatch) {
    throw new ApiError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
  }

  const accessToken = generateToken({
    id: user.id,
    role: user.role,
    restaurantId: user.restaurantId,
    mustChangePassword: user.mustChangePassword,
  });

  resetLoginRateLimit(clientIp, email);

  return {
    accessToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      mustChangePassword: user.mustChangePassword,
    },
  };
}

export async function getProfile(userId: string) {
  const user = await repository.findById(userId);
  if (!user) {
    throw new ApiError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt,
  };
}
