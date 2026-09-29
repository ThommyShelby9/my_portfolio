export type Vec3 = [number, number, number];

export interface RibbonParams {
  radius: number;
  width: number;
  halfTwists: number;
  strandsPerSide: number;
  samples: number;
}

export const DESKTOP_RIBBON: RibbonParams = { radius: 1.9, width: 0.95, halfTwists: 1, strandsPerSide: 6, samples: 360 };
export const MOBILE_RIBBON: RibbonParams = { ...DESKTOP_RIBBON, strandsPerSide: 3, samples: 240 };

/** With an odd number of half-twists a strand returns on the opposite side after one lap. */
export function laps(p: RibbonParams): 1 | 2 {
  return p.halfTwists % 2 === 1 ? 2 : 1;
}

/** Offsets across the ribbon width; two-lap strands draw both sides, so they only need one side. */
export function strandOffsets(p: RibbonParams): number[] {
  const half = p.width / 2;
  const offsets: number[] = [];
  for (let k = 0; k < p.strandsPerSide; k++) {
    const off = ((k + 0.5) / p.strandsPerSide) * half;
    offsets.push(off);
    if (laps(p) === 1) offsets.push(-off);
  }
  return offsets;
}

/** Point of the strand at `offset` for a base-circle angle (radians, may exceed 2π). */
export function pointAt(p: RibbonParams, offset: number, angle: number): Vec3 {
  const twist = (p.halfTwists * angle) / 2;
  const radial = p.radius + offset * Math.cos(twist);
  return [radial * Math.cos(angle), radial * Math.sin(angle), offset * Math.sin(twist)];
}

export function strandPath(p: RibbonParams, offset: number): Vec3[] {
  const count = p.samples * laps(p);
  return Array.from({ length: count }, (_, i) => pointAt(p, offset, (i / p.samples) * 2 * Math.PI));
}

/** Inner strands slightly thicker than the edges, for a machined look. */
export function strandRadius(p: RibbonParams, offset: number): number {
  const edge = Math.abs(offset) / (p.width / 2);
  return 0.026 + 0.014 * (1 - edge);
}
