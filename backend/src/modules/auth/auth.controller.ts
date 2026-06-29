import type { Request, Response, NextFunction } from 'express';
import * as service from './auth.service.js';
import { sendSuccess } from '../../shared/index.js';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.login(req.body.email, req.body.password);
    sendSuccess(res, result, 'Inicio de sesión exitoso');
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // TODO: implement token blacklist if needed
    sendSuccess(res, null, 'Sesión cerrada correctamente');
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await service.getProfile(req.user!.id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}
