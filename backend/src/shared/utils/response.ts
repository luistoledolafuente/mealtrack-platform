import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T | null = null, message = 'Operación realizada correctamente', statusCode = 200): void {
  res.status(statusCode).json({ success: true, message, data });
}

export function sendCreated<T>(res: Response, data: T | null = null, message = 'Recurso creado correctamente'): void {
  sendSuccess(res, data, message, 201);
}
