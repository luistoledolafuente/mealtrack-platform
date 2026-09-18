import type { Request, Response, NextFunction } from 'express';
import * as service from './qr.service.js';
import { sendSuccess } from '../../shared/index.js';

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
