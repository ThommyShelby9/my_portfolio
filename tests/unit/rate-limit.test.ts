import { describe, expect, it } from 'vitest';
import { createRateLimiter } from '@/lib/server/rate-limit';

describe('createRateLimiter', () => {
  it('allows up to the limit then refuses with a positive retryAfter', () => {
    let t = 1000;
    const rl = createRateLimiter({ limit: 5, windowMs: 3_600_000, now: () => t });
    for (let i = 0; i < 5; i++) expect(rl.check('a').allowed).toBe(true);
    const r = rl.check('a');
    expect(r.allowed).toBe(false);
    expect(r.retryAfterMs).toBeGreaterThan(0);
  });

  it('slides the window', () => {
    let t = 0;
    const rl = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t });
    expect(rl.check('a').allowed).toBe(true);
    t = 500;
    expect(rl.check('a').allowed).toBe(true);
    expect(rl.check('a').allowed).toBe(false);
    t = 1001;
    expect(rl.check('a').allowed).toBe(true);
    expect(rl.check('a').allowed).toBe(false);
    t = 2000;
    expect(rl.check('a').allowed).toBe(true);
  });

  it('keeps keys independent', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => 0 });
    expect(rl.check('a').allowed).toBe(true);
    expect(rl.check('a').allowed).toBe(false);
    expect(rl.check('b').allowed).toBe(true);
  });
});
