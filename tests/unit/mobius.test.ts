import { describe, expect, it } from 'vitest';
import {
  DESKTOP_RIBBON, MOBILE_RIBBON, laps, pointAt, strandOffsets, strandPath, strandRadius, type Vec3,
} from '../../src/components/sculpture/mobius';

const close = (a: Vec3, b: Vec3) => a.every((v, i) => Math.abs(v - b[i]) < 1e-9);

describe('Möbius ribbon geometry', () => {
  it('needs two laps per strand for an odd number of half-twists', () => {
    expect(laps(DESKTOP_RIBBON)).toBe(2);
    expect(laps({ ...DESKTOP_RIBBON, halfTwists: 2 })).toBe(1);
  });

  it('uses only positive offsets when strands run two laps (12 visible on desktop, 6 on mobile)', () => {
    const d = strandOffsets(DESKTOP_RIBBON);
    const m = strandOffsets(MOBILE_RIBBON);
    expect(d).toHaveLength(6);
    expect(m).toHaveLength(3);
    expect(d.every((o) => o > 0 && o < DESKTOP_RIBBON.width / 2)).toBe(true);
  });

  it('uses mirrored offsets when the twist is even', () => {
    const offsets = strandOffsets({ ...DESKTOP_RIBBON, halfTwists: 2 });
    expect(offsets).toHaveLength(12);
    expect(offsets.filter((o) => o < 0)).toHaveLength(6);
  });

  it('has the Möbius property: one lap swaps the side of the ribbon', () => {
    const off = 0.3;
    expect(close(pointAt(DESKTOP_RIBBON, off, 2 * Math.PI), pointAt(DESKTOP_RIBBON, -off, 0))).toBe(true);
  });

  it('closes every strand after its laps', () => {
    for (const off of strandOffsets(DESKTOP_RIBBON)) {
      const turns = laps(DESKTOP_RIBBON) * 2 * Math.PI;
      expect(close(pointAt(DESKTOP_RIBBON, off, turns), pointAt(DESKTOP_RIBBON, off, 0))).toBe(true);
    }
  });

  it('samples each strand evenly over its laps', () => {
    const path = strandPath(DESKTOP_RIBBON, 0.2);
    expect(path).toHaveLength(DESKTOP_RIBBON.samples * 2);
    expect(close(path[0], pointAt(DESKTOP_RIBBON, 0.2, 0))).toBe(true);
  });

  it('keeps centre points on the base circle', () => {
    const [x, y, z] = pointAt(DESKTOP_RIBBON, 0, 1.234);
    expect(Math.hypot(x, y)).toBeCloseTo(DESKTOP_RIBBON.radius, 9);
    expect(z).toBeCloseTo(0, 9);
  });

  it('makes edge strands thinner than inner strands', () => {
    const offsets = strandOffsets(DESKTOP_RIBBON);
    const inner = strandRadius(DESKTOP_RIBBON, offsets[0]);
    const outer = strandRadius(DESKTOP_RIBBON, offsets[offsets.length - 1]);
    expect(inner).toBeGreaterThan(outer);
    expect(outer).toBeGreaterThan(0.02);
  });
});
