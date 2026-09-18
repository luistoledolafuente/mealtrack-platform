import type { Request, Response, NextFunction } from 'express';
import * as service from './meal-plans.service.js';
import { sendSuccess, sendCreated } from '../../shared/index.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const restaurantId = req.tenantId || req.user!.restaurantId;
    if (!restaurantId) {
      return sendSuccess(res, []);
    }
    const plans = await service.list(restaurantId);
    sendSuccess(res, plans);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await service.getById(req.params.id);
    sendSuccess(res, plan);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const restaurantId = req.tenantId || req.user!.restaurantId;
    if (!restaurantId) {
      throw new Error('Restaurant context required');
    }
    const plan = await service.create({ ...req.body, restaurantId });
    sendCreated(res, plan, 'Plan de comida creado correctamente');
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await service.update(req.params.id, req.body, req.user!.role, req.tenantId);
    sendSuccess(res, plan, 'Plan de comida actualizado correctamente');
  } catch (err) {
    next(err);
  }
}
