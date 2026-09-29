export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
}

export function createRateLimiter(opts: {
  limit: number;
  windowMs: number;
  now?: () => number;
}): RateLimiter {
  const { limit, windowMs } = opts;
  const now = opts.now ?? Date.now;
  const hits = new Map<string, number[]>();

  function prune(t: number) {
    for (const [key, list] of hits) {
      const fresh = list.filter((h) => t - h < windowMs);
      if (fresh.length === 0) hits.delete(key);
      else hits.set(key, fresh);
    }
  }

  return {
    check(key) {
      const t = now();
      prune(t);
      const list = hits.get(key) ?? [];
      if (list.length >= limit) {
        return { allowed: false, retryAfterMs: Math.max(1, list[0] + windowMs - t) };
      }
      list.push(t);
      hits.set(key, list);
      return { allowed: true, retryAfterMs: 0 };
    },
  };
}

export const formLimiter = createRateLimiter({ limit: 5, windowMs: 3_600_000 });
