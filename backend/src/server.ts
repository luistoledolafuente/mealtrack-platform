import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/database.js';

async function main() {
  // Verify database connection
  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (err) {
    logger.error({ err }, 'Failed to connect to database');
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    logger.info(`MealTrack API running on port ${env.port} (${env.nodeEnv})`);
    logger.info(`API base: ${env.apiPrefix}`);
  });

  // Graceful shutdown
  function shutdown(signal: string) {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main();
