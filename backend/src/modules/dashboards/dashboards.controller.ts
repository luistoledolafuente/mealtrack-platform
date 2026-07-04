import type { Request, Response, NextFunction } from 'express';
import * as service from './dashboards.service.js';
import { sendSuccess } from '../../shared/index.js';

export async function getStudentDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dashboard = await service.getStudentDashboard(req.user!.id);
    sendSuccess(res, dashboard, 'Resumen obtenido correctamente');
  } catch (err) {
    next(err);
  }
}

export async function getAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.tenantId) {
      sendSuccess(res, { totalStudents: 0, todayConsumed: 0, pendingAdjustments: 0, activeSubscriptions: 0 });
      return;
    }
    const dashboard = await service.getAdminDashboard(req.tenantId);
    sendSuccess(res, dashboard, 'Resumen obtenido correctamente');
  } catch (err) {
    next(err);
  }
}

export async function getSuperadminDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendSuccess(res, { message: 'Superadmin dashboard coming soon' });
  } catch (err) {
    next(err);
  }
}
