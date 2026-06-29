import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.logLevel,
  ...(env.isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});
