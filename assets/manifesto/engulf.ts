export function clamp(v: number, a: number, b: number): number {
  return v < a ? a : v > b ? b : v
}

// Ingestion progress for a scene block whose center is `distance` px from the
// viewport center (positive = still below the hole), given viewport height `vh`.
export function ingestT(distance: number, vh: number): number {
  return clamp((0.15 * vh - distance) / (0.6 * vh), 0, 1)
}

export interface EngulfTransform {
  scale: number
  shift: number
  rotate: number
  opacity: number
  blur: number
}

export function computeEngulf(distance: number, vh: number): EngulfTransform {
  const t = ingestT(distance, vh)
  return {
    scale: 1 - 0.92 * t,
    shift: -distance * t,
    rotate: -34 * t,
    opacity: 1 - Math.pow(t, 1.25),
    blur: 13 * t,
  }
}

// Flare contribution of one block mid-ingestion; peaks (=1) at t=0.5.
export function computeFeed(distance: number, vh: number): number {
  const t = ingestT(distance, vh)
  return t * (1 - t) * 4
}
