import type { NextFunction, Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../shared/index.js';
import * as service from './operational-closures.service.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { sendSuccess(res, await service.list(req.user!.role, req.tenantId)); } catch (error) { next(error); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.create(req.body, req.user!.id, req.user!.role, req.tenantId);
    sendCreated(res, result, 'Cierre operativo creado correctamente');
  } catch (error) { next(error); }
}
