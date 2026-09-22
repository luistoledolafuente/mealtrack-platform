import type { Request, Response, NextFunction } from 'express';
import * as service from './daily-meals.service.js';
import { sendSuccess, sendCreated } from '../../shared/index.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const meals = await service.list(
      req.query as any,
      req.user!.id,
      req.user!.role,
      req.tenantId,
    );
    sendSuccess(res, meals);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const meal = await service.getById(req.params.id, req.user!.id, req.user!.role, req.tenantId);
    sendSuccess(res, meal);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const meal = await service.create(
      { ...req.body, idempotencyKey: req.header('Idempotency-Key') ?? req.body.idempotencyKey },
      req.user!.id,
      req.user!.role,
      req.user!.restaurantId,
    );
    sendCreated(res, meal, 'Consumo registrado correctamente');
  } catch (err) {
    next(err);
  }
}
