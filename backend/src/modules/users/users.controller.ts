import type { Request, Response, NextFunction } from 'express';
import * as service from './users.service.js';
import { sendSuccess } from '../../shared/index.js';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await service.getProfile(req.user!.id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await service.updateProfile(req.user!.id, req.body);
    sendSuccess(res, user, 'Perfil actualizado correctamente');
  } catch (err) {
    next(err);
  }
}
