/**
 * RATE LIMITING - Memory-based
 * Security: Prevent brute force & DDoS attacks
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) delete store[key];
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  max: number;
  windowMs: number;
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  max: 100,
  windowMs: 15 * 60 * 1000,
};

export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  max: 5,
  windowMs: 15 * 60 * 1000,
};

export function checkRateLimit(
  ip: string,
  endpoint: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  
  if (!store[key] || store[key].resetAt < now) {
    store[key] = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    
    return {
      allowed: true,
      remaining: config.max - 1,
      resetAt: store[key].resetAt,
    };
  }
  
  store[key].count++;
  
  const remaining = Math.max(0, config.max - store[key].count);
  const allowed = store[key].count <= config.max;
  
  return {
    allowed,
    remaining,
    resetAt: store[key].resetAt,
  };
}

export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}




