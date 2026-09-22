import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const isDev = nodeEnv !== 'production';
const databaseUrl = process.env.DATABASE_URL || '';
const jwtSecret = process.env.JWT_SECRET || (isDev ? 'dev-secret' : '');
const corsOrigin = process.env.CORS_ORIGIN || (isDev ? '*' : '');

if (!isDev) {
  const invalid = [
    !databaseUrl && 'DATABASE_URL',
    (jwtSecret.length < 32 || jwtSecret === 'dev-secret') && 'JWT_SECRET',
    (!corsOrigin || corsOrigin === '*') && 'CORS_ORIGIN',
  ].filter(Boolean);

  if (invalid.length > 0) {
    throw new Error(`Invalid production environment: ${invalid.join(', ')}`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv,
  isDev,
  databaseUrl,

  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin,

  logLevel: process.env.LOG_LEVEL || 'debug',
} as const;
