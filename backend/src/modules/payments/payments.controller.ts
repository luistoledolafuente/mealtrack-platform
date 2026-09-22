import type { Request, Response, NextFunction } from 'express';
import * as service from './payments.service.js';
import { sendSuccess, sendCreated } from '../../shared/index.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payments = await service.list(req.user!.id, req.user!.role, req.tenantId);
    sendSuccess(res, payments);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payment = await service.getById(req.params.id, req.user!.id, req.user!.role, req.tenantId);
    sendSuccess(res, payment);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payment = await service.create(req.body, req.user!.id, req.tenantId);
    sendCreated(res, payment, 'Pago registrado correctamente');
  } catch (err) {
    next(err);
  }
}
