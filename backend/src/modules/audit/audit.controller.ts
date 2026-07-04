import type { Request, Response, NextFunction } from 'express';
import * as service from './audit.service.js';
import { sendSuccess } from '../../shared/index.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.list(req.query as any);
    sendSuccess(res, result.logs);
  } catch (err) {
    next(err);
  }
}
