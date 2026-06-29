import { defineStore } from 'pinia'

export type SpaceMode = 'ambient' | 'orrery' | 'focus'

interface SpaceState {
  mode: SpaceMode
  enabled: boolean
}

/**
 * Scene state for the WebGL space layer. `mode` is driven by the route in
 * later lots (ambient = home, orrery = /work, focus = /work/[slug]).
 * `enabled` mirrors whether the engine actually started (capability + motion).
 */
export const useSpaceStore = defineStore('space', {
  state: (): SpaceState => ({ mode: 'ambient', enabled: false }),
  actions: {
    setMode(m: SpaceMode) {
      this.mode = m
    },
    setEnabled(v: boolean) {
      this.enabled = v
    },
  },
})
