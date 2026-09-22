interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const loginAttemptsByIp = new Map<string, RateLimitEntry>();
const loginAttemptsByEmail = new Map<string, RateLimitEntry>();

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 5;

function getEnvNumber(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

export const LOGIN_RATE_LIMIT_WINDOW_MS = getEnvNumber('LOGIN_RATE_LIMIT_WINDOW_MS', DEFAULT_WINDOW_MS);
export const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = getEnvNumber('LOGIN_RATE_LIMIT_MAX_ATTEMPTS', DEFAULT_MAX_ATTEMPTS);

function cleanup(map: Map<string, RateLimitEntry>): void {
  const now = Date.now();
  for (const [key, entry] of map.entries()) {
    if (entry.resetAt < now) {
      map.delete(key);
    }
  }
}

function checkAndIncrement(map: Map<string, RateLimitEntry>, key: string): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup(map);
  const now = Date.now();
  const entry = map.get(key);

  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + LOGIN_RATE_LIMIT_WINDOW_MS,
    };
    map.set(key, newEntry);
    return { allowed: true, remaining: LOGIN_RATE_LIMIT_MAX_ATTEMPTS - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: LOGIN_RATE_LIMIT_MAX_ATTEMPTS - entry.count, resetAt: entry.resetAt };
}

export function checkLoginRateLimit(ip: string, email: string): { allowed: boolean; remaining: number; resetAt: number; reason?: string } {
  const ipResult = checkAndIncrement(loginAttemptsByIp, ip);
  if (!ipResult.allowed) {
    return { allowed: false, remaining: 0, resetAt: ipResult.resetAt, reason: 'IP rate limit exceeded' };
  }

  const emailKey = email.toLowerCase();
  const emailResult = checkAndIncrement(loginAttemptsByEmail, emailKey);
  if (!emailResult.allowed) {
    return { allowed: false, remaining: 0, resetAt: emailResult.resetAt, reason: 'Email rate limit exceeded' };
  }

  return { allowed: true, remaining: Math.min(ipResult.remaining, emailResult.remaining), resetAt: Math.min(ipResult.resetAt, emailResult.resetAt) };
}

export function resetLoginRateLimit(ip: string, email: string): void {
  loginAttemptsByIp.delete(ip);
  loginAttemptsByEmail.delete(email.toLowerCase());
}

export function getRateLimitStats(): { ipEntries: number; emailEntries: number } {
  return {
    ipEntries: loginAttemptsByIp.size,
    emailEntries: loginAttemptsByEmail.size,
  };
}

export function clearRateLimit(): void {
  loginAttemptsByIp.clear();
  loginAttemptsByEmail.clear();
}