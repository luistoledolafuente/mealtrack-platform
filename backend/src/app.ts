import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { tenantContext } from './shared/middleware/tenant.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));

// Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

// Multi-tenant context
app.use(tenantContext);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use(env.apiPrefix, routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    error: { code: 'NOT_FOUND' },
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
