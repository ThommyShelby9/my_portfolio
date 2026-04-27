import { usePreferredReducedMotion } from '@vueuse/core'

/**
 * SSR-safe wrapper. On the server, returns 'no-preference' (always
 * animate) — actual user preference is respected after hydration.
 */
export function useReducedMotion() {
  const pref = usePreferredReducedMotion()
  const reduce = computed(() => pref.value === 'reduce')
  return { reduce, raw: pref }
}
