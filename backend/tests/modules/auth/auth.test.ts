import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../../src/app.js';
import { prisma } from '../../../src/config/database.js';
import { comparePassword } from '../../../src/shared/utils/crypto.js';
import { checkLoginRateLimit, clearRateLimit } from '../../../src/shared/utils/rateLimiter.js';
import { logger, REDACT_PATHS } from '../../../src/config/logger.js';

vi.mock('../../../src/shared/utils/crypto.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/shared/utils/crypto.js')>();
  return {
    ...actual,
    comparePassword: vi.fn(),
  };
});

const mockActiveUser = {
  id: '11111111-1111-1111-1111-111111111111',
  fullName: 'Active User',
  email: 'active@test.com',
  passwordHash: '$2a$10$validhash',
  role: 'student',
  restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  isActive: true,
  mustChangePassword: false,
};

const mockInactiveUser = {
  id: '22222222-2222-2222-2222-222222222222',
  fullName: 'Inactive User',
  email: 'inactive@test.com',
  passwordHash: '$2a$10$validhash',
  role: 'student',
  restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  isActive: false,
  mustChangePassword: false,
};

const mockMustChangePasswordUser = {
  id: '33333333-3333-3333-3333-333333333333',
  fullName: 'Must Change User',
  email: 'mustchange@test.com',
  passwordHash: '$2a$10$validhash',
  role: 'student',
  restaurantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  isActive: true,
  mustChangePassword: true,
};

function resetMocks() {
  vi.clearAllMocks();
  clearRateLimit();
}

beforeAll(() => {
  clearRateLimit();
});

describe('Auth - Login', () => {
  beforeEach(() => {
    resetMocks();
    (comparePassword as any).mockResolvedValue(true);
  });
  afterEach(resetMocks);

  it('usuario activo con credenciales válidas = 200', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ ...mockActiveUser, email: 'login-ok@test.com' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login-ok@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('login-ok@test.com');
    expect(res.body.data.user.mustChangePassword).toBe(false);
  });

  it('usuario inactivo rechazado con error genérico = 401', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ ...mockInactiveUser, email: 'login-inactive@test.com' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login-inactive@test.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(res.body.message).toBe('Credenciales inválidas');
    expect(JSON.stringify(res.body)).not.toContain('isActive');
    expect(JSON.stringify(res.body)).not.toContain('inactivo');
  });

  it('credenciales incorrectas = 401', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ ...mockActiveUser, email: 'login-badpass@test.com' });
    (comparePassword as any).mockResolvedValue(false);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login-badpass@test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('usuario inexistente = 401 (mismo error que credenciales inválidas)', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login-missing@test.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('Auth - Rate Limit', () => {
  beforeEach(() => {
    resetMocks();
  });
  afterEach(resetMocks);

  it('permite intentos dentro del límite', () => {
    for (let i = 0; i < 5; i++) {
      const result = checkLoginRateLimit('192.168.10.1', 'rl-unit@test.com');
      expect(result.allowed).toBe(true);
    }
  });

  it('bloquea cuando se excede el límite por IP', () => {
    for (let i = 0; i < 5; i++) {
      checkLoginRateLimit('192.168.10.2', 'rl-ip@test.com');
    }
    const result = checkLoginRateLimit('192.168.10.2', 'rl-ip@test.com');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('IP rate limit exceeded');
  });

  it('bloquea cuando se excede el límite por email', () => {
    for (let i = 0; i < 5; i++) {
      checkLoginRateLimit('192.168.10.3', 'rl-email@test.com');
    }
    const result = checkLoginRateLimit('10.0.0.9', 'rl-email@test.com');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Email rate limit exceeded');
  });

  it('un login exitoso limpia los límites de IP y email', async () => {
    const email = 'rl-clear@test.com';
    (prisma.user.findUnique as any).mockResolvedValue({ ...mockActiveUser, email });
    (comparePassword as any).mockResolvedValue(false);

    for (let i = 0; i < 4; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'wrongpassword' });
    }

    (comparePassword as any).mockResolvedValue(true);
    const okRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'password123' });
    expect(okRes.status).toBe(200);

    (comparePassword as any).mockResolvedValue(false);
    const afterRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'wrongpassword' });
    expect(afterRes.status).toBe(401);
    expect(afterRes.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('Auth - Rate Limit Integration', () => {
  beforeEach(() => {
    resetMocks();
    (comparePassword as any).mockResolvedValue(false);
  });
  afterEach(resetMocks);

  it('excede rate limit en login real = 429', async () => {
    const email = `rl-int-${Date.now()}@test.com`;
    (prisma.user.findUnique as any).mockResolvedValue({ ...mockActiveUser, email });

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'wrongpassword' });
    }

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'wrongpassword' });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});

describe('Auth - mustChangePassword', () => {
  beforeEach(() => {
    resetMocks();
    (comparePassword as any).mockResolvedValue(true);
  });
  afterEach(resetMocks);

  async function loginAsMustChange(email: string) {
    (prisma.user.findUnique as any).mockResolvedValue({ ...mockMustChangePasswordUser, email });
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'password123' });
    expect(loginRes.status).toBe(200);
    return loginRes.body.data.accessToken as string;
  }

  it('usuario con mustChangePassword no puede consultar ruta normal = 403', async () => {
    const token = await loginAsMustChange('mcp-block@test.com');

    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('PASSWORD_CHANGE_REQUIRED');
  });

  it('usuario con mustChangePassword no puede consultar /auth/me = 403', async () => {
    const token = await loginAsMustChange('mcp-authme@test.com');

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('PASSWORD_CHANGE_REQUIRED');
  });

  it('usuario con mustChangePassword puede acceder a /auth/logout = 200', async () => {
    const token = await loginAsMustChange('mcp-logout@test.com');

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('usuario con mustChangePassword puede cambiar su propia contraseña = 200', async () => {
    const email = 'mcp-change@test.com';
    (prisma.user.findUnique as any)
      .mockResolvedValueOnce({ ...mockMustChangePasswordUser, email })
      .mockResolvedValueOnce({ ...mockMustChangePasswordUser, email, passwordHash: '$2a$10$newhash' });
    (prisma.user.update as any).mockResolvedValue({
      ...mockMustChangePasswordUser,
      email,
      mustChangePassword: false,
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'password123' });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'password123', newPassword: 'newpassword123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('JWT antiguo sigue bloqueado y nuevo login desbloquea', async () => {
    const email = 'mcp-renew@test.com';
    const oldUser = { ...mockMustChangePasswordUser, email };
    const renewedUser = { ...mockMustChangePasswordUser, email, mustChangePassword: false };

    (prisma.user.findUnique as any).mockResolvedValue(oldUser);
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'password123' });
    expect(loginRes.status).toBe(200);
    const oldToken = loginRes.body.data.accessToken as string;

    (prisma.user.findUnique as any).mockResolvedValue({ ...oldUser, passwordHash: '$2a$10$newhash' });
    (prisma.user.update as any).mockResolvedValue(renewedUser);
    const changeRes = await request(app)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${oldToken}`)
      .send({ currentPassword: 'password123', newPassword: 'newpassword123' });
    expect(changeRes.status).toBe(200);

    const blockedRes = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${oldToken}`);
    expect(blockedRes.status).toBe(403);
    expect(blockedRes.body.error.code).toBe('PASSWORD_CHANGE_REQUIRED');

    (prisma.user.findUnique as any).mockResolvedValue(renewedUser);
    const reloginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'newpassword123' });
    expect(reloginRes.status).toBe(200);
    expect(reloginRes.body.data.user.mustChangePassword).toBe(false);
    const newToken = reloginRes.body.data.accessToken as string;

    (prisma.user.findUnique as any).mockResolvedValue(renewedUser);
    const okRes = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${newToken}`);
    expect(okRes.status).toBe(200);
    expect(okRes.body.success).toBe(true);
  });
});

describe('Logs - Redaction', () => {
  it('el logger real expone redacción para campos sensibles', async () => {
    expect(logger).toBeDefined();

    expect(REDACT_PATHS).toContain('req.headers.authorization');
    for (const field of ['password', 'passwordHash', 'currentPassword', 'newPassword', 'token', 'qrToken', 'accessToken', 'refreshToken', 'DATABASE_URL']) {
      const covered = REDACT_PATHS.some((p) => p.endsWith(`.${field}`) && !p.startsWith('req.headers.'));
      expect(covered).toBe(true);
    }
  });

  it('la redacción del logger real censura Authorization y password', async () => {
    const pino = await import('pino');
    const logs: any[] = [];
    const stream = {
      write: (msg: string) => {
        logs.push(JSON.parse(msg));
      },
    };

    const testLogger = pino.default(
      {
        level: 'info',
        redact: {
          paths: REDACT_PATHS,
          censor: '[REDACTED]',
        },
      },
      stream,
    );

    testLogger.info(
      {
        req: {
          headers: { authorization: 'Bearer secret-token' },
          body: {
            password: 'secret123',
            passwordHash: 'hash123',
            currentPassword: 'old123',
            newPassword: 'new123',
            token: 'tok123',
            qrToken: 'qr123',
            accessToken: 'acc123',
            refreshToken: 'ref123',
            DATABASE_URL: 'postgresql://user:pass@host/db',
          },
        },
      },
      'test',
    );

    expect(logs.length).toBeGreaterThan(0);
    const log = logs[0];
    expect(log.req.headers.authorization).toBe('[REDACTED]');
    expect(log.req.body.password).toBe('[REDACTED]');
    expect(log.req.body.passwordHash).toBe('[REDACTED]');
    expect(log.req.body.currentPassword).toBe('[REDACTED]');
    expect(log.req.body.newPassword).toBe('[REDACTED]');
    expect(log.req.body.token).toBe('[REDACTED]');
    expect(log.req.body.qrToken).toBe('[REDACTED]');
    expect(log.req.body.accessToken).toBe('[REDACTED]');
    expect(log.req.body.refreshToken).toBe('[REDACTED]');
    expect(log.req.body.DATABASE_URL).toBe('[REDACTED]');
  });
});
