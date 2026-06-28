const logger = require('../logger/logger');

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Error interno del servidor';

  if (!err.isOperational) {
    logger.error('Unexpected error:', err);
  }

  const body = {
    success: false,
    message,
    error: {
      code: err.errorCode || 'INTERNAL_ERROR',
    },
  };

  if (err.details) {
    body.error.details = err.details;
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
