import type { Request, Response, NextFunction } from 'express';
import * as service from './notifications.service.js';
import { sendSuccess } from '../../shared/index.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notifications = await service.list(req.user!.id);
    sendSuccess(res, notifications);
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.markAsRead(req.params.id, req.user!.id);
    sendSuccess(res, null, 'Notificación marcada como leída');
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.markAllAsRead(req.user!.id);
    sendSuccess(res, null, 'Todas las notificaciones marcadas como leídas');
  } catch (err) {
    next(err);
  }
}
