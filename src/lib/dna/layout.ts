import { HELIX, helixPoint, type HelixShape } from './helix';
import { mulberry32 } from './rng';

export const ROLE = { strandA: 0, strandB: 1, rung: 2, dust: 3 } as const;

export interface ParticleLayout {
  count: number;
  /** State « helix »: xyz per particle. */
  helix: Float32Array;
  /** State « cloud » (scene 00 start): xyz per particle. */
  cloud: Float32Array;
  /** ROLE value per particle. */
  role: Float32Array;
  /** Base pair index 0..2 (helix third), -1 for dust. */
  pair: Float32Array;
  /** Per-particle random in [0, 1), used by the shader for staggering and breathing. */
  seed: Float32Array;
}

interface LayoutOptions { count: number; seed?: number; rungs?: number; shape?: HelixShape }

const STRAND_SHARE = 0.7;
const RUNG_SHARE = 0.18;

/** Precomputes every particle position for each helix state. Pure and deterministic for a seed. */
export function buildLayout({ count, seed = 7, rungs = 24, shape = HELIX }: LayoutOptions): ParticleLayout {
  if (!Number.isInteger(count) || count <= 0) throw new Error(`buildLayout: count must be a positive integer, got ${count}`);
  const rnd = mulberry32(seed);
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5; // cheap bell curve in [-1, 1]
  const helix = new Float32Array(count * 3);
  const cloud = new Float32Array(count * 3);
  const role = new Float32Array(count);
  const pair = new Float32Array(count);
  const seeds = new Float32Array(count);
  const strands = Math.round(count * STRAND_SHARE);
  const rungEnd = strands + Math.round(count * RUNG_SHARE);
  const third = (u: number) => Math.min(2, Math.floor(u * 3));

  for (let i = 0; i < count; i++) {
    seeds[i] = rnd();
    const o = i * 3;
    // Cloud: a wide, shallow box the helix condenses from.
    cloud[o] = (rnd() - 0.5) * 9;
    cloud[o + 1] = (rnd() - 0.5) * 10;
    cloud[o + 2] = (rnd() - 0.5) * 4.5 - 0.75;

    if (i < strands) {
      const strand = (i % 2) as 0 | 1;
      const u = rnd();
      const [x, y, z] = helixPoint(u, strand, shape);
      helix[o] = x + gauss() * 0.06;
      helix[o + 1] = y + gauss() * 0.06;
      helix[o + 2] = z + gauss() * 0.06;
      role[i] = strand === 0 ? ROLE.strandA : ROLE.strandB;
      pair[i] = third(u);
    } else if (i < rungEnd) {
      const r = Math.floor(rnd() * rungs);
      const u = (r + 0.5) / rungs;
      const [ax, ay, az] = helixPoint(u, 0, shape);
      const [bx, by, bz] = helixPoint(u, 1, shape);
      const t = rnd();
      helix[o] = ax + (bx - ax) * t + gauss() * 0.02;
      helix[o + 1] = ay + (by - ay) * t + gauss() * 0.02;
      helix[o + 2] = az + (bz - az) * t + gauss() * 0.02;
      role[i] = ROLE.rung;
      pair[i] = third(u);
    } else {
      // Dust drifts around the helix in every state.
      helix[o] = cloud[o];
      helix[o + 1] = cloud[o + 1];
      helix[o + 2] = cloud[o + 2];
      role[i] = ROLE.dust;
      pair[i] = -1;
    }
  }
  return { count, helix, cloud, role, pair, seed: seeds };
}
