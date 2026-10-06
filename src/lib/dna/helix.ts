export type Vec3 = readonly [number, number, number];
export interface HelixShape { length: number; radius: number; turns: number }

/** Scene units; the camera in DnaCanvas is set for this size. */
export const HELIX: HelixShape = { length: 9, radius: 1.15, turns: 3.2 };

/** Point of strand 0 or 1 at `u` in [0, 1] along the vertical axis (y from -length/2 to +length/2). */
export function helixPoint(u: number, strand: 0 | 1, shape: HelixShape = HELIX): Vec3 {
  const a = u * shape.turns * Math.PI * 2 + strand * Math.PI;
  return [Math.cos(a) * shape.radius, (u - 0.5) * shape.length, Math.sin(a) * shape.radius];
}
