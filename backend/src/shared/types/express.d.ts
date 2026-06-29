import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        restaurantId: string | null;
      };
      tenantId: string | null;
    }
  }
}

export {};
