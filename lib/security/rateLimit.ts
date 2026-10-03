/**
 * Simple in-memory fixed-window rate limiter.
 *
 * Suitable for V1 / single-instance deployments. In production this should be
 * backed by Redis or the edge runtime so limits are shared across instances.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }
  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }
  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, retryAfterSeconds: 0 };
}

export const LIMITS = {
  godCreation: { limit: 5, windowMs: 60 * 60 * 1000 },
  prayer: { limit: 30, windowMs: 60 * 60 * 1000 },
  aiGeneration: { limit: 10, windowMs: 60 * 60 * 1000 },
  search: { limit: 120, windowMs: 60 * 1000 },
} as const;

export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "local";
  return `${scope}:${fwd.split(",")[0].trim()}`;
}
