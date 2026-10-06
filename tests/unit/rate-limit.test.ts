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

  it('hard-caps the number of keys, evicting the oldest-inserted first', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => 0, maxKeys: 3 });
    for (const k of ['a', 'b', 'c', 'd', 'e']) expect(rl.check(k).allowed).toBe(true);
    // a and b were evicted, so they are fresh again; d and e are still limited.
    expect(rl.check('e').allowed).toBe(false);
    expect(rl.check('d').allowed).toBe(false);
    expect(rl.check('a').allowed).toBe(true);
  });

  it('sweeps expired keys so they do not count against the cap', () => {
    let t = 0;
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t, maxKeys: 3 });
    rl.check('a');
    rl.check('b');
    t = 2000;
    for (const k of ['c', 'd', 'e']) rl.check(k);
    expect(rl.check('c').allowed).toBe(false);
  });

  it('prunes only the checked key between sweeps', () => {
    let t = 0;
    const rl = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t });
    rl.check('a');
    rl.check('a');
    t = 1001;
    expect(rl.check('a').allowed).toBe(true);
    expect(rl.check('a').allowed).toBe(true);
    expect(rl.check('a').allowed).toBe(false);
  });
});
