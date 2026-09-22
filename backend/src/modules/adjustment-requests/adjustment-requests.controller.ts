import type { Request, Response, NextFunction } from 'express';
import * as service from './adjustment-requests.service.js';
import { sendSuccess, sendCreated } from '../../shared/index.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requests = await service.list(req.user!.id, req.user!.role, req.tenantId);
    sendSuccess(res, requests);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.create(req.body, req.user!.id, req.user!.role, req.tenantId);
    sendCreated(res, result, 'Solicitud de ajuste creada correctamente');
  } catch (err) {
    next(err);
  }
}

export async function review(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.review(
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.role,
      req.user!.restaurantId,
    );
    sendSuccess(res, result, 'Solicitud revisada correctamente');
  } catch (err) {
    next(err);
  }
}
