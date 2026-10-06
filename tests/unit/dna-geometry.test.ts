import { describe, expect, it } from 'vitest';
import { particleBudget } from '@/lib/dna/budget';
import { GENES, PAIRS } from '@/lib/dna/genes';
import { HELIX, helixPoint } from '@/lib/dna/helix';
import { buildLayout, ROLE } from '@/lib/dna/layout';
import { mulberry32 } from '@/lib/dna/rng';

describe('mulberry32', () => {
  it('is deterministic and stays in [0, 1)', () => {
    const a = mulberry32(42), b = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
  it('differs with the seed', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe('genes', () => {
  it('has six genes in three pairs, each gene used once', () => {
    expect(GENES).toHaveLength(6);
    expect(PAIRS.flat().sort()).toEqual([...GENES].sort());
  });
});

describe('helixPoint', () => {
  it('stays on the cylinder and spans the axis', () => {
    for (const u of [0, 0.25, 0.5, 1]) for (const s of [0, 1] as const) {
      const [x, y, z] = helixPoint(u, s);
      expect(Math.hypot(x, z)).toBeCloseTo(HELIX.radius, 6);
      expect(y).toBeCloseTo((u - 0.5) * HELIX.length, 6);
    }
  });
  it('puts the two strands opposite each other', () => {
    const [ax, , az] = helixPoint(0.3, 0);
    const [bx, , bz] = helixPoint(0.3, 1);
    expect(ax).toBeCloseTo(-bx, 6);
    expect(az).toBeCloseTo(-bz, 6);
  });
});

describe('buildLayout', () => {
  const layout = buildLayout({ count: 5000, seed: 7 });
  it('sizes every attribute', () => {
    expect(layout.count).toBe(5000);
    expect(layout.helix).toHaveLength(15000);
    expect(layout.cloud).toHaveLength(15000);
    expect(layout.role).toHaveLength(5000);
    expect(layout.pair).toHaveLength(5000);
    expect(layout.seed).toHaveLength(5000);
  });
  it('is deterministic for a seed and changes with it', () => {
    expect(buildLayout({ count: 500, seed: 7 }).helix).toEqual(buildLayout({ count: 500, seed: 7 }).helix);
    expect(buildLayout({ count: 500, seed: 8 }).helix).not.toEqual(buildLayout({ count: 500, seed: 7 }).helix);
  });
  it('splits roles roughly 70 % strands, 18 % rungs, 12 % dust', () => {
    const counts = [0, 0, 0, 0];
    layout.role.forEach((r) => counts[r]++);
    expect((counts[ROLE.strandA] + counts[ROLE.strandB]) / 5000).toBeCloseTo(0.7, 1);
    expect(counts[ROLE.rung] / 5000).toBeCloseTo(0.18, 1);
    expect(counts[ROLE.dust] / 5000).toBeCloseTo(0.12, 1);
  });
  it('keeps strand and rung particles near the helix, inside its length', () => {
    for (let i = 0; i < layout.count; i++) {
      if (layout.role[i] === ROLE.dust) continue;
      const [x, y, z] = [layout.helix[i * 3], layout.helix[i * 3 + 1], layout.helix[i * 3 + 2]];
      expect(Math.hypot(x, z)).toBeLessThanOrEqual(HELIX.radius + 0.25);
      expect(Math.abs(y)).toBeLessThanOrEqual(HELIX.length / 2 + 0.25);
    }
  });
  it('assigns pairs by helix third, and -1 to dust', () => {
    for (let i = 0; i < layout.count; i++) {
      const p = layout.pair[i];
      if (layout.role[i] === ROLE.dust) expect(p).toBe(-1);
      else expect([0, 1, 2]).toContain(p);
    }
  });
  it('spreads the cloud wider than the helix', () => {
    let maxX = 0;
    for (let i = 0; i < layout.count; i++) maxX = Math.max(maxX, Math.abs(layout.cloud[i * 3]));
    expect(maxX).toBeGreaterThan(HELIX.radius * 2);
  });
  it('rejects a non-positive count', () => {
    expect(() => buildLayout({ count: 0 })).toThrow();
  });
});

describe('particleBudget', () => {
  it('gives desktops 20 000 particles', () => {
    expect(particleBudget({ width: 1440, cores: 8, saveData: false, deviceMemory: 8 })).toBe(20000);
  });
  it('gives phones 6 000', () => {
    expect(particleBudget({ width: 390, cores: 8, saveData: false })).toBe(6000);
  });
  it('drops to 4 000 on weak devices or Save-Data', () => {
    expect(particleBudget({ width: 1440, cores: 2, saveData: false })).toBe(4000);
    expect(particleBudget({ width: 1440, cores: 8, saveData: true })).toBe(4000);
    expect(particleBudget({ width: 1440, cores: 8, saveData: false, deviceMemory: 2 })).toBe(4000);
  });
});
