const config = require('../../config');

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Error interno del servidor';

  if (!err.isOperational) {
    console.error('Unexpected error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: err.errorCode || 'INTERNAL_ERROR',
      ...(err.details && { details: err.details }),
    },
  });
}

module.exports = errorHandler;
