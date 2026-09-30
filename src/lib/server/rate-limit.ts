export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
}

const MAX_KEYS = 5000;

export function createRateLimiter(opts: {
  limit: number;
  windowMs: number;
  now?: () => number;
  maxKeys?: number;
}): RateLimiter {
  const { limit, windowMs } = opts;
  const maxKeys = opts.maxKeys ?? MAX_KEYS;
  const now = opts.now ?? Date.now;
  const sweepEvery = windowMs / 10;
  const hits = new Map<string, number[]>();
  let lastSweep = now();

  /** Drop expired keys, then evict oldest-inserted keys beyond the cap. */
  function sweep(t: number) {
    lastSweep = t;
    for (const [key, list] of hits) {
      if (list.every((h) => t - h >= windowMs)) hits.delete(key);
    }
    let excess = hits.size - maxKeys;
    if (excess <= 0) return;
    for (const key of hits.keys()) {
      hits.delete(key);
      if (--excess <= 0) break;
    }
  }

  return {
    check(key) {
      const t = now();
      if (t - lastSweep >= sweepEvery) sweep(t);
      const list = (hits.get(key) ?? []).filter((h) => t - h < windowMs);
      if (list.length >= limit) {
        hits.set(key, list);
        return { allowed: false, retryAfterMs: Math.max(1, list[0] + windowMs - t) };
      }
      list.push(t);
      // Re-insert so the map order tracks recent activity for eviction.
      hits.delete(key);
      hits.set(key, list);
      if (hits.size > maxKeys) sweep(t);
      return { allowed: true, retryAfterMs: 0 };
    },
  };
}

export const formLimiter = createRateLimiter({ limit: 5, windowMs: 3_600_000 });

/** Visit counter: at most 60 hits per minute per IP; beyond that, hits are silently not counted. */
export const hitLimiter = createRateLimiter({ limit: 60, windowMs: 60_000 });
