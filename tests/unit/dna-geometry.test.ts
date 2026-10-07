import { describe, expect, it } from 'vitest';
import { particleBudget } from '@/lib/dna/budget';
import { GENES, PAIRS } from '@/lib/dna/genes';
import { HELIX, helixPoint } from '@/lib/dna/helix';
import { buildLayout, CLUSTER_CENTRES, CLUSTER_COUNT, GROUPS, LAYER_COUNT, ROLE, TUNNEL_LENGTH } from '@/lib/dna/layout';
import { signaturePath, signatureRadius } from '@/lib/dna/signature';
import { traversal, TRAVEL } from '@/lib/dna/traversal';
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
  it('gives desktops 40 000 particles', () => {
    expect(particleBudget({ width: 1440, cores: 8, saveData: false, deviceMemory: 8 })).toBe(40000);
  });
  it('gives phones 12 000', () => {
    expect(particleBudget({ width: 390, cores: 8, saveData: false })).toBe(12000);
  });
  it('drops to 6 000 on weak devices or Save-Data', () => {
    expect(particleBudget({ width: 1440, cores: 2, saveData: false })).toBe(6000);
    expect(particleBudget({ width: 1440, cores: 8, saveData: true })).toBe(6000);
    expect(particleBudget({ width: 1440, cores: 8, saveData: false, deviceMemory: 2 })).toBe(6000);
  });
});

describe('signatures', () => {
  it('keeps the radius within [0.68, 1.32]', () => {
    for (const genes of [['engineering', 'product'], ['architecture', 'innovation', 'devops', 'leadership']] as const) {
      for (let k = 0; k < 360; k++) {
        const r = signatureRadius(genes, (k / 360) * Math.PI * 2);
        expect(r).toBeGreaterThanOrEqual(0.68 - 1e-9);
        expect(r).toBeLessThanOrEqual(1.32 + 1e-9);
      }
    }
  });
  it('differs between different gene sets', () => {
    const a = signaturePath(['engineering', 'product']);
    const b = signaturePath(['devops', 'leadership']);
    expect(a).not.toBe(b);
  });
  it('draws a closed path inside its box', () => {
    const d = signaturePath(['engineering', 'product', 'architecture'], 100);
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    for (const n of d.match(/-?\d+(?:\.\d+)?/g)!.map(Number)) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(100);
    }
  });
});

describe('layout states', () => {
  const layout = buildLayout({ count: 6000, seed: 3, signatures: [['engineering', 'product'], ['architecture', 'innovation'], ['devops', 'leadership']] });
  const at = (arr: Float32Array, i: number) => [arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]];

  it('sizes every state and keeps the helix unchanged by them', () => {
    for (const arr of [layout.layers, layout.signatures, layout.clusters, layout.calm]) expect(arr).toHaveLength(18000);
    expect(layout.group).toHaveLength(6000);
    expect(buildLayout({ count: 500, seed: 7 }).helix).toEqual(buildLayout({ count: 500, seed: 7, signatures: [['devops', 'product']] }).helix);
  });

  it('assigns integer groups in [0, GROUPS)', () => {
    for (const g of layout.group) {
      expect(Number.isInteger(g)).toBe(true);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThan(GROUPS);
    }
  });

  it('stacks five layers, top first', () => {
    for (let i = 0; i < layout.count; i++) {
      if (layout.role[i] === ROLE.dust) continue;
      const [x, y, z] = at(layout.layers, i);
      const layer = layout.group[i] % LAYER_COUNT;
      expect(Math.abs(y - (3 - layer * 1.5))).toBeLessThan(0.15);
      expect(Math.hypot(x, z)).toBeLessThanOrEqual(1.7 + 1e-6);
    }
  });

  it('puts each signature ring at its height and radius', () => {
    for (let i = 0; i < layout.count; i++) {
      if (layout.role[i] === ROLE.dust) continue;
      const [x, y, z] = at(layout.signatures, i);
      const s = layout.group[i] % 3;
      expect(Math.abs(y - (2.6 - s * 2.6))).toBeLessThan(0.2);
      expect(Math.hypot(x, z)).toBeGreaterThan(1.35 * 0.68 - 0.2);
      expect(Math.hypot(x, z)).toBeLessThan(1.35 * 1.32 + 0.2);
    }
  });

  it('gathers clusters around their centres', () => {
    for (let i = 0; i < layout.count; i++) {
      if (layout.role[i] === ROLE.dust) continue;
      const [x, y, z] = at(layout.clusters, i);
      const [cx, cy, cz] = CLUSTER_CENTRES[layout.group[i] % CLUSTER_COUNT];
      expect(Math.hypot(x - cx, y - cy, z - cz)).toBeLessThanOrEqual(0.55 + 1e-6);
    }
  });

  it('tightens the helix in the calm state and leaves dust where it is', () => {
    for (let i = 0; i < layout.count; i++) {
      const [hx, , hz] = at(layout.helix, i);
      const [cx, , cz] = at(layout.calm, i);
      if (layout.role[i] === ROLE.dust) {
        expect(at(layout.calm, i)).toEqual(at(layout.cloud, i));
        expect(at(layout.layers, i)).toEqual(at(layout.cloud, i));
      } else {
        expect(Math.hypot(cx, cz)).toBeCloseTo(Math.hypot(hx, hz) * 0.8, 5);
      }
    }
  });

  it('requires at least one signature', () => {
    expect(() => buildLayout({ count: 10, signatures: [] })).toThrow();
  });
});

describe('traversal', () => {
  const layout = buildLayout({ count: 6000, seed: 5 });
  it('lays a long helix around the camera axis', () => {
    expect(layout.tunnel).toHaveLength(18000);
    for (let i = 0; i < layout.count; i++) {
      const [x, y, z] = [layout.tunnel[i * 3], layout.tunnel[i * 3 + 1], layout.tunnel[i * 3 + 2]];
      expect(z).toBeLessThanOrEqual(2 + 1e-6);
      expect(z).toBeGreaterThanOrEqual(2 - TUNNEL_LENGTH - 1e-6);
      if (layout.role[i] !== ROLE.dust) expect(Math.hypot(x, y)).toBeLessThanOrEqual(1.7 + 0.45);
    }
  });
  it('gives every helix particle its place along the helix, and dust none', () => {
    for (let i = 0; i < layout.count; i++) {
      const a = layout.along[i];
      if (layout.role[i] === ROLE.dust) expect(a).toBe(-1);
      else {
        expect(a).toBeGreaterThanOrEqual(0);
        expect(a).toBeLessThanOrEqual(1);
      }
    }
  });
  it('leaves the other states unchanged', () => {
    expect(buildLayout({ count: 500, seed: 7 }).helix).toEqual(buildLayout({ count: 500, seed: 7 }).helix);
  });
});

describe('traversal progress', () => {
  it('is closed outside, fully inside in the middle, and flies deeper with the scroll', () => {
    expect(traversal(-1)).toEqual({ mix: 0, z: 0 });
    expect(traversal(0).mix).toBe(0);
    expect(traversal(0.09).mix).toBeCloseTo(0.5, 5);
    expect(traversal(0.5).mix).toBe(1);
    expect(traversal(1).mix).toBe(0);
    expect(traversal(0.5).z).toBeCloseTo(TRAVEL / 2, 5);
    expect(traversal(0.6).z).toBeGreaterThan(traversal(0.4).z);
  });
});
