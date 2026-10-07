import { PAIRS, type Gene } from './genes';
import { HELIX, helixPoint, type HelixShape } from './helix';
import { mulberry32 } from './rng';
import { signatureRadius } from './signature';

export const ROLE = { strandA: 0, strandB: 1, rung: 2, dust: 3 } as const;

/** Index of each state in the shader (spec §4.1); 0 is only the load-time intro. */
export const STATE = { cloud: 0, helix: 1, layers: 2, signatures: 3, clusters: 4, calm: 5 } as const;
export type StateIndex = (typeof STATE)[keyof typeof STATE];

/** Groups per particle: 60 is divisible by the 5 layers, 3 signatures and 4 clusters. */
export const GROUPS = 60;
export const LAYER_COUNT = 5;
export const CLUSTER_COUNT = 4;

export interface ParticleLayout {
  count: number;
  /** State « cloud » (scene 00 start): xyz per particle. */
  cloud: Float32Array;
  /** State « helix » (scenes 00-01): xyz per particle. */
  helix: Float32Array;
  /** State « layers » (scene 02, construction): xyz per particle. */
  layers: Float32Array;
  /** State « signatures » (scene 03, one ring per featured project): xyz per particle. */
  signatures: Float32Array;
  /** State « clusters » (scene 04, the lab): xyz per particle. */
  clusters: Float32Array;
  /** State « calm » (scene 05): xyz per particle. */
  calm: Float32Array;
  /**
   * The traversal (between scenes 00 and 01): a long helix around the camera's axis (z), from
   * z = 2 to z = -TUNNEL_LENGTH + 2, which the camera flies through.
   */
  tunnel: Float32Array;
  /** Position along the helix in [0, 1] for strands and rungs (the light pulse runs on it), -1 for dust. */
  along: Float32Array;
  /** ROLE value per particle. */
  role: Float32Array;
  /** Base pair index 0..2 (helix third), -1 for dust. */
  pair: Float32Array;
  /** Integer group 0..GROUPS-1: layer = group % 5, signature = group % signatures, cluster = group % 4. */
  group: Float32Array;
  /** Per-particle random in [0, 1), used by the shader for staggering and breathing. */
  seed: Float32Array;
}

interface LayoutOptions {
  count: number;
  seed?: number;
  rungs?: number;
  shape?: HelixShape;
  /** Genes of each featured project, top ring first (scene 03). Defaults to the three base pairs. */
  signatures?: readonly (readonly Gene[])[];
}

const STRAND_SHARE = 0.7;
const RUNG_SHARE = 0.18;

/** Vertical span used by the stacked states, matched to the helix length. */
const LAYER_TOP = 3;
const LAYER_GAP = 1.5;
const LAYER_RADIUS = 1.7;
const SIGNATURE_GAP = 2.6;
const SIGNATURE_RADIUS = 1.35;
export const CLUSTER_CENTRES: readonly (readonly [number, number, number])[] = [
  [-2.2, 2.4, 0.3],
  [1.9, 1.3, -0.4],
  [-1.6, -1.2, 0.5],
  [2.1, -2.6, 0],
];
const CLUSTER_RADIUS = 0.55;
const CALM_SCALE = 0.8;
export const TUNNEL_LENGTH = 60;
const TUNNEL_RADIUS = 1.7;
const TUNNEL_TURNS = 14;
const TUNNEL_PAIRS = 160;

/** Precomputes every particle position for each state. Pure and deterministic for a seed. */
export function buildLayout({
  count,
  seed = 7,
  rungs = 24,
  shape = HELIX,
  signatures = PAIRS,
}: LayoutOptions): ParticleLayout {
  if (!Number.isInteger(count) || count <= 0) throw new Error(`buildLayout: count must be a positive integer, got ${count}`);
  if (signatures.length === 0) throw new Error('buildLayout: at least one signature is required');
  const rnd = mulberry32(seed);
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5; // cheap bell curve in [-1, 1]
  // A second stream for the later states, so the helix (and its poster) never changes when they do.
  const rnd2 = mulberry32(seed + 101);
  const gauss2 = () => (rnd2() + rnd2() + rnd2() - 1.5) / 1.5;

  const cloud = new Float32Array(count * 3);
  const helix = new Float32Array(count * 3);
  const layers = new Float32Array(count * 3);
  const sig = new Float32Array(count * 3);
  const clusters = new Float32Array(count * 3);
  const calm = new Float32Array(count * 3);
  const tunnel = new Float32Array(count * 3);
  const along = new Float32Array(count);
  // A third stream for the traversal, so adding it changed none of the other states.
  const rnd3 = mulberry32(seed + 202);
  const gauss3 = () => (rnd3() + rnd3() + rnd3() - 1.5) / 1.5;
  const role = new Float32Array(count);
  const pair = new Float32Array(count);
  const group = new Float32Array(count);
  const seeds = new Float32Array(count);
  const strands = Math.round(count * STRAND_SHARE);
  const rungEnd = strands + Math.round(count * RUNG_SHARE);
  const third = (u: number) => Math.min(2, Math.floor(u * 3));
  const ringTop = ((signatures.length - 1) * SIGNATURE_GAP) / 2;

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
      role[i] = ROLE.dust;
      pair[i] = -1;
    }

    group[i] = Math.floor(rnd2() * GROUPS);
    if (role[i] === ROLE.dust) {
      // Dust drifts around the shapes in every state.
      for (const arr of [helix, layers, sig, clusters, calm]) {
        arr[o] = cloud[o];
        arr[o + 1] = cloud[o + 1];
        arr[o + 2] = cloud[o + 2];
      }
      continue;
    }

    // Layers: five horizontal discs, a third of the particles on each rim, top = Idea.
    const layer = group[i] % LAYER_COUNT;
    const la = rnd2() * Math.PI * 2;
    const lr = rnd2() < 0.35 ? LAYER_RADIUS : LAYER_RADIUS * Math.sqrt(rnd2());
    layers[o] = Math.cos(la) * lr;
    layers[o + 1] = LAYER_TOP - layer * LAYER_GAP + gauss2() * 0.03;
    layers[o + 2] = Math.sin(la) * lr;

    // Signatures: one horizontal rose ring per featured project.
    const s = group[i] % signatures.length;
    const sa = rnd2() * Math.PI * 2;
    const sr = SIGNATURE_RADIUS * signatureRadius(signatures[s], sa) + gauss2() * 0.04;
    sig[o] = Math.cos(sa) * sr;
    sig[o + 1] = ringTop - s * SIGNATURE_GAP + gauss2() * 0.05;
    sig[o + 2] = Math.sin(sa) * sr;

    // Clusters: four small spheres, the lab's mutations.
    const [cx, cy, cz] = CLUSTER_CENTRES[group[i] % CLUSTER_COUNT];
    const theta = rnd2() * Math.PI * 2;
    const phi = Math.acos(2 * rnd2() - 1);
    const cr = CLUSTER_RADIUS * Math.cbrt(rnd2());
    clusters[o] = cx + Math.sin(phi) * Math.cos(theta) * cr;
    clusters[o + 1] = cy + Math.cos(phi) * cr;
    clusters[o + 2] = cz + Math.sin(phi) * Math.sin(theta) * cr;

    // Calm: the helix again, tighter.
    calm[o] = helix[o] * CALM_SCALE;
    calm[o + 1] = helix[o + 1];
    calm[o + 2] = helix[o + 2] * CALM_SCALE;
  }
  // Traversal positions and the along-helix parameter (recovered from the helix height).
  for (let i = 0; i < count; i++) {
    const o = i * 3;
    if (role[i] === ROLE.dust) {
      tunnel[o] = (rnd3() - 0.5) * 14;
      tunnel[o + 1] = (rnd3() - 0.5) * 10;
      tunnel[o + 2] = 2 - rnd3() * TUNNEL_LENGTH;
      along[i] = -1;
      continue;
    }
    along[i] = Math.min(1, Math.max(0, helix[o + 1] / shape.length + 0.5));
    if (role[i] === ROLE.rung) {
      const p = Math.floor(rnd3() * TUNNEL_PAIRS);
      const u = (p + 0.5) / TUNNEL_PAIRS;
      const a = u * TUNNEL_TURNS * Math.PI * 2;
      const t = 1 - 2 * rnd3();
      tunnel[o] = Math.cos(a) * TUNNEL_RADIUS * t;
      tunnel[o + 1] = Math.sin(a) * TUNNEL_RADIUS * t;
      tunnel[o + 2] = 2 - u * TUNNEL_LENGTH;
    } else {
      const u = rnd3();
      const a = u * TUNNEL_TURNS * Math.PI * 2 + (role[i] === ROLE.strandB ? Math.PI : 0);
      const r = TUNNEL_RADIUS + gauss3() * 0.1;
      tunnel[o] = Math.cos(a) * r;
      tunnel[o + 1] = Math.sin(a) * r;
      tunnel[o + 2] = 2 - u * TUNNEL_LENGTH;
    }
  }
  return { count, cloud, helix, layers, signatures: sig, clusters, calm, tunnel, along, role, pair, group, seed: seeds };
}
