import type { Request, Response, NextFunction } from 'express';
import * as service from './subscriptions.service.js';
import { sendSuccess, sendCreated } from '../../shared/index.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subscriptions = await service.list(req.user!.id, req.user!.role, req.tenantId);
    sendSuccess(res, subscriptions);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subscription = await service.getById(req.params.id, req.user!.id, req.user!.role, req.tenantId);
    sendSuccess(res, subscription);
  } catch (err) {
    next(err);
  }
}

export async function getMySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const summary = await service.getMySummary(req.user!.id, req.user!.role, req.tenantId);
    sendSuccess(res, summary);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subscription = await service.create(req.body, req.user!.id, req.tenantId);
    sendCreated(res, subscription, 'Suscripción creada correctamente');
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subscription = await service.update(req.params.id, req.body, req.user!.role, req.tenantId);
    sendSuccess(res, subscription, 'Suscripción actualizada correctamente');
  } catch (err) {
    next(err);
  }
}
