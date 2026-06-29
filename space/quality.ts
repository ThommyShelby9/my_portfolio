export interface Capability {
  supported: boolean
  lowPerf: boolean
  reduce: boolean
}

export interface QualitySettings {
  enabled: boolean
  maxDpr: number
}

/**
 * Single source of truth for whether the WebGL space engine runs and at
 * what device-pixel-ratio cap. Pure — no DOM, no side effects.
 */
export function resolveQuality(cap: Capability): QualitySettings {
  if (!cap.supported || cap.reduce) {
    return { enabled: false, maxDpr: 1 }
  }
  return { enabled: true, maxDpr: cap.lowPerf ? 1 : 1.75 }
}
