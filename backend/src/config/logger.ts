import pino from 'pino';
import { env } from './env.js';

export const REDACT_PATHS = [
  'req.headers.authorization', 'req.body.password', 'req.body.passwordHash',
  'req.body.currentPassword', 'req.body.newPassword', 'req.body.token',
  'req.body.qrToken', 'req.body.accessToken', 'req.body.refreshToken',
  'req.body.DATABASE_URL', 'body.password', 'body.token', 'body.qrToken',
  'body.accessToken', 'body.refreshToken', 'res.body.password', 'res.body.token',
];

export const logger = pino({
  level: env.logLevel,
  redact: { paths: [...REDACT_PATHS], censor: '[REDACTED]' },
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
