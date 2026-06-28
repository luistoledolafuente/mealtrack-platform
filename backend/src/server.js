const app = require('./app');
const config = require('./config');
const logger = require('./shared/logger/logger');

const server = app.listen(config.port, () => {
  logger.info(`MealTrack API running on port ${config.port} (${config.nodeEnv})`);
  logger.info(`API base: ${config.apiPrefix}`);
});

// Graceful shutdown
function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  // Force exit after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
