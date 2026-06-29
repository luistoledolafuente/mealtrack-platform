import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { ApiError } from '../errors/ApiError.js';

export interface JwtPayload {
  id: string;
  role: string;
  restaurantId: string | null;
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

    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError('Token inválido o expirado', 401, 'INVALID_TOKEN'));
  }
}
