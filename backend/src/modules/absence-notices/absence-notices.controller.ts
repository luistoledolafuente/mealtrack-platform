import type { NextFunction, Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../shared/index.js';
import * as service from './absence-notices.service.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { sendSuccess(res, await service.list(req.user!.id, req.user!.role, req.tenantId)); } catch (error) { next(error); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.create(req.body, req.user!.id, req.user!.role, req.tenantId);
    sendCreated(res, result, 'Aviso de ausencia creado correctamente');
  } catch (error) { next(error); }
}

export async function review(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.review(req.params.id, req.body, req.user!.id, req.user!.role, req.tenantId);
    sendSuccess(res, result, 'Aviso de ausencia revisado correctamente');
  } catch (error) { next(error); }
}
