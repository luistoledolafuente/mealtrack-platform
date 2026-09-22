import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { ApiError } from '../errors/ApiError.js';

export interface JwtPayload {
  id: string;
  role: string;
  restaurantId: string | null;
  mustChangePassword?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError('Token no proporcionado', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;

    // Tenant scope is a property of the signed token.  A caller-controlled
    // header must never be allowed to select a different restaurant.
    if ((decoded.role === 'student' || decoded.role === 'admin') && !decoded.restaurantId) {
      throw new ApiError('Contexto de restaurante requerido', 403, 'TENANT_CONTEXT_REQUIRED');
    }

    req.user = decoded;
    req.tenantId = decoded.restaurantId;

    if (decoded.mustChangePassword) {
      const isPasswordChange = req.method === 'PATCH' && req.path === '/me/password';
      const isLogout = req.method === 'POST' && req.path === '/logout';
      if (!isPasswordChange && !isLogout) {
        throw new ApiError(
          'Debes cambiar tu contraseña antes de continuar',
          403,
          'PASSWORD_CHANGE_REQUIRED',
        );
      }
    }
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError('Token inválido o expirado', 401, 'INVALID_TOKEN'));
  }
}
