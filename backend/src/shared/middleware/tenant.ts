import { Request, Response, NextFunction } from 'express';

export function tenantContext(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.restaurantId) {
    req.tenantId = req.user.restaurantId;
  } else {
    req.tenantId = req.headers['x-tenant-id'] as string || null;
  }
  next();
}

declare global {
  namespace Express {
    interface Request {
      tenantId: string | null;
    }
  }
}
