import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger.js';
import { ApiError } from '../errors/ApiError.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError && err.isOperational) {
    const body: Record<string, unknown> = {
      success: false,
      message: err.message,
      error: { code: err.errorCode },
    };
    if (err.details) body.error = { ...body.error as object, details: err.details };

    res.status(err.statusCode).json(body);
    return;
  }

  logger.error({ err }, 'Unexpected error');
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: { code: 'INTERNAL_ERROR' },
  });
}
