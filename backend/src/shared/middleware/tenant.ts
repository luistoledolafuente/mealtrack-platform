import { Request, Response, NextFunction } from 'express';

export function tenantContext(req: Request, _res: Response, next: NextFunction): void {
  req.tenantId = req.user?.restaurantId ?? null;
  next();
}

declare global {
  namespace Express {
    interface Request {
      tenantId: string | null;
    }
  }
}
