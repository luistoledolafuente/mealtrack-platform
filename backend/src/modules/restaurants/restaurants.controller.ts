import type { Request, Response, NextFunction } from 'express';
import * as service from './restaurants.service.js';
import { sendSuccess, sendCreated } from '../../shared/index.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const restaurants = await service.list(req.user!.role, req.tenantId);
    sendSuccess(res, restaurants);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const restaurant = await service.getById(req.params.id, req.user!.role, req.tenantId);
    sendSuccess(res, restaurant);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const restaurant = await service.create(req.body);
    sendCreated(res, restaurant, 'Restaurante creado correctamente');
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const restaurant = await service.update(req.params.id, req.body);
    sendSuccess(res, restaurant, 'Restaurante actualizado correctamente');
  } catch (err) {
    next(err);
  }
}
