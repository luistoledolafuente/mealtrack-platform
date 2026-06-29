import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError.js';

export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError('No autenticado', 401, 'UNAUTHORIZED'));
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return next(new ApiError('No tienes permisos para esta acción', 403, 'FORBIDDEN'));
    }

    next();
  };
}
