import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRateLimiter } from '../../server/utils/rate-limiter'

describe('rate limiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-26T10:00:00Z'))
  })

  it('allows up to N requests within the window', () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000 })
    expect(limiter.check('1.1.1.1')).toEqual({ allowed: true, remaining: 2 })
    expect(limiter.check('1.1.1.1')).toEqual({ allowed: true, remaining: 1 })
    expect(limiter.check('1.1.1.1')).toEqual({ allowed: true, remaining: 0 })
  })

  it('blocks the (N+1)-th request', () => {
    const limiter = createRateLimiter({ max: 2, windowMs: 60_000 })
    limiter.check('2.2.2.2')
    limiter.check('2.2.2.2')
    const r = limiter.check('2.2.2.2')
    expect(r.allowed).toBe(false)
    expect(r.retryAfterMs).toBeGreaterThan(0)
  })

  it('resets after the window passes', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 })
    limiter.check('3.3.3.3')
    expect(limiter.check('3.3.3.3').allowed).toBe(false)
    vi.advanceTimersByTime(61_000)
    expect(limiter.check('3.3.3.3').allowed).toBe(true)
  })

  it('keeps separate counters per key', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 })
    expect(limiter.check('a').allowed).toBe(true)
    expect(limiter.check('a').allowed).toBe(false)
    expect(limiter.check('b').allowed).toBe(true)
  })
})
