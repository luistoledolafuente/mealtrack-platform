import type { Request, Response, NextFunction } from 'express';
import * as service from './qr.service.js';
import { ApiError, sendSuccess } from '../../shared/index.js';

export async function issue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.issueQrToken(req.body.subscriptionId, req.user!.id);
    sendSuccess(res, result, 'Token QR generado correctamente');
  } catch (err) {
    next(err);
  }
}

export async function validate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.validateQrToken(
      req.body.token,
      req.user!.id,
      req.user!.role,
      req.user!.restaurantId,
    );
    sendSuccess(res, result, 'Consumo registrado correctamente mediante QR');
  } catch (err) {
    next(err);
  }
}

export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.createRestaurantQrSession(req.body, req.user!.id, req.user!.restaurantId);
    sendSuccess(res, result, 'Sesión QR creada correctamente');
  } catch (err) {
    next(err);
  }
}

export async function scanSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idempotencyKey = req.header('Idempotency-Key');
    if (!idempotencyKey) {
      throw new ApiError('Idempotency-Key es obligatorio', 400, 'IDEMPOTENCY_KEY_REQUIRED');
    }
    const result = await service.scanRestaurantQrSession(req.body, req.user!.id, idempotencyKey);
    sendSuccess(res, result, 'Consumo registrado correctamente mediante QR');
  } catch (err) {
    next(err);
  }
}
