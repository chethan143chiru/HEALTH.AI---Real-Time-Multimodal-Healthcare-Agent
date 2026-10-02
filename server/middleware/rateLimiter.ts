/**
 * HEALTH.AI Lightweight In-Memory Rate Limiter
 * Protects expensive AI endpoints, authentication, and session creation
 * from accidental or abusive request floods. No external dependency.
 */

import type { Request, Response, NextFunction } from 'express';

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const buckets = new Map<string, Bucket>();

  // Periodic cleanup so the map cannot grow unbounded.
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, Math.max(options.windowMs, 60_000));
  if (typeof cleanup.unref === 'function') cleanup.unref();

  return function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const identity =
      (req as any).user?.uid ||
      (typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : req.socket?.remoteAddress) ||
      'unknown';

    const key = `${identity}:${req.method}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > options.max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: options.message || 'Too many requests. Please slow down and try again shortly.'
      });
    }

    return next();
  };
}
