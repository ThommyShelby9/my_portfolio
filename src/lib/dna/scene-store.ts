import type { Gene } from './genes';

/**
 * What the one site-wide DNA scene shows (spec §4.2, revised 2026-10-07: 3D on every page).
 * `home` hands the state to the scroll (DnaTrajectory); a `page` sets a fixed state and the stage
 * eases into it, so moving between pages morphs the helix instead of reloading it.
 */
export type DnaSceneDescriptor =
  | { mode: 'home'; signatures: readonly (readonly Gene[])[] }
  | { mode: 'page'; state: number; signatures?: readonly (readonly Gene[])[] };

/** Pages without their own descriptor: the calm, tight helix (« prêt à construire »). */
export const DEFAULT_PAGE_SCENE: DnaSceneDescriptor = { mode: 'page', state: 5 };

let current: DnaSceneDescriptor = DEFAULT_PAGE_SCENE;
const listeners = new Set<() => void>();

export function setDnaScene(next: DnaSceneDescriptor): void {
  current = next;
  listeners.forEach((l) => l());
}

export function getDnaScene(): DnaSceneDescriptor {
  return current;
}

export function subscribeDnaScene(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
