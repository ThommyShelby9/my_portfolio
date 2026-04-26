/**
 * useReducedMotion Composable
 * Detect and respect user's motion preferences
 */

import { watch } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import { useTerminalStore } from '@/stores/terminal'
import { useAnimations } from './useAnimations'

export function useReducedMotion() {
  const store = useTerminalStore()
  const reducedMotion = usePreferredReducedMotion()
  const animations = useAnimations()

  // Watch for changes in reduced motion preference
  watch(reducedMotion, (prefersReduced) => {
    const isReduced = prefersReduced === 'reduce'
    store.setReducedMotion(isReduced)

    if (isReduced) {
      // Kill all running animations
      animations.killAllAnimations()
    }
  }, { immediate: true })

  return {
    reducedMotion
  }
}
