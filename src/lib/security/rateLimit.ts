// src/lib/security/rateLimit.ts
// DXM369 Rate Limiting — In-memory rate limiter with sliding window

import { NextRequest } from 'next/server';
import { log } from '../log';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (replace with Redis in production)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Maximum requests allowed in window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Custom identifier (defaults to IP + route) */
  keyGenerator?: (req: NextRequest) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a request
 * @param req - NextRequest object
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(req: NextRequest, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const { max, windowMs, keyGenerator } = config;

  // Generate unique key for this request
  const key = keyGenerator ? keyGenerator(req) : getDefaultKey(req);

  // Get or create entry
  let entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    store.set(key, entry);
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  const allowed = entry.count <= max;
  const remaining = Math.max(0, max - entry.count);
  const retryAfter = allowed ? undefined : Math.ceil((entry.resetAt - now) / 1000);

  if (!allowed) {
    log.warn('[RATE_LIMIT_EXCEEDED]', {
      key,
      count: entry.count,
      max,
      resetAt: new Date(entry.resetAt).toISOString(),
    });
  }

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    retryAfter,
  };
}

/**
 * Default key generator: IP + pathname
 */
function getDefaultKey(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
             req.headers.get('x-real-ip') ||
             'unknown';
  const pathname = req.nextUrl.pathname;
  return `${ip}:${pathname}`;
}

/**
 * Rate limit presets for common use cases
 */
export const RateLimitPresets = {
  /** Admin operations: 60 requests per hour */
  ADMIN: {
    max: 60,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  /** Shadow scraper: 30 requests per hour */
  SHADOW_SCRAPER: {
    max: 30,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  /** Database writes: 100 requests per hour */
  DB_WRITE: {
    max: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  /** General API: 300 requests per 15 minutes */
  API_GENERAL: {
    max: 300,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
} as const;

/**
 * Reset rate limit for a specific key (admin utility)
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
  log.info('[RATE_LIMIT_RESET]', { key });
}

/**
 * Get current rate limit stats (admin utility)
 */
export function getRateLimitStats(): {
  totalKeys: number;
  entries: Array<{ key: string; count: number; resetAt: string }>;
} {
  const entries = Array.from(store.entries()).map(([key, entry]) => ({
    key,
    count: entry.count,
    resetAt: new Date(entry.resetAt).toISOString(),
  }));

  return {
    totalKeys: store.size,
    entries,
  };
}
