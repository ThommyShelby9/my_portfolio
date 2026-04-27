import { LRUCache } from 'lru-cache'

type Bucket = { count: number; resetAt: number }
type Result = { allowed: boolean; remaining: number; retryAfterMs?: number }

export type RateLimiterOptions = {
  max: number
  windowMs: number
  cacheSize?: number
}

export function createRateLimiter(opts: RateLimiterOptions) {
  const cache = new LRUCache<string, Bucket>({
    max: opts.cacheSize ?? 5_000,
    ttl: opts.windowMs,
    updateAgeOnGet: false,
  })

  function check(key: string): Result {
    const now = Date.now()
    const bucket = cache.get(key)

    if (!bucket || bucket.resetAt <= now) {
      cache.set(key, { count: 1, resetAt: now + opts.windowMs })
      return { allowed: true, remaining: opts.max - 1 }
    }

    if (bucket.count >= opts.max) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: bucket.resetAt - now,
      }
    }

    bucket.count += 1
    cache.set(key, bucket)
    return { allowed: true, remaining: opts.max - bucket.count }
  }

  return { check }
}

let briefLimiter: ReturnType<typeof createRateLimiter> | null = null
export function getBriefRateLimiter() {
  if (!briefLimiter) {
    briefLimiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 })
  }
  return briefLimiter
}
