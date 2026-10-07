/** How deep the camera flies through the helix over the whole traversal, in scene units. */
export const TRAVEL = 46;

/**
 * Traversal state for a scroll progress through the traversal space (0 when its top enters the
 * viewport, 1 when its bottom leaves): enter over the first 18 %, fly, leave over the last 18 %.
 */
export function traversal(progress: number): { mix: number; z: number } {
  const p = Math.min(1, Math.max(0, progress));
  const enter = Math.min(1, p / 0.18);
  const leave = Math.min(1, (1 - p) / 0.18);
  return { mix: Math.min(enter, leave), z: p * TRAVEL };
}
