const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const routes = require('./routes');
const tenantContext = require('./shared/middleware/tenantContext');
const errorHandler = require('./shared/middleware/errorHandler');
const logger = require('./shared/logger/logger');

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));

// Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan(config.isDev ? 'dev' : 'combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// Multi-tenant context
app.use(tenantContext);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use(config.apiPrefix, routes);

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

module.exports = app;
