import type { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../shared/index.js';
import * as service from './consumptions.service.js';

export async function scan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const consumption = await service.scanLunch(
      req.body,
      req.user!.id,
      req.header('Idempotency-Key') ?? undefined,
    );
    sendSuccess(res, consumption, 'Consumo registrado correctamente mediante QR');
  } catch (error) {
    next(error);
  }
}
