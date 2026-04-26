import type { ThemeMode, ResolvedTheme } from '~/types/theme'
import { THEME_COOKIE, THEME_DEFAULT } from '~/types/theme'

/**
 * Resolve a theme mode into a concrete light|dark choice.
 * Pure function — testable without a browser.
 */
export function resolveTheme(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  if (mode === 'dark') return 'dark'
  if (mode === 'light') return 'light'
  if (mode === 'auto') return prefersDark ? 'dark' : 'light'
  return 'dark'
}

/**
 * Composable: reactive theme state synced with a cookie and the DOM.
 *
 * - On first visit: cookie absent → mode = 'auto', resolved from prefers-color-scheme.
 * - User toggle: writes cookie + applies data-theme on <html>.
 * - SSR-safe: writes data-theme during render so there is no flash.
 */
export function useTheme() {
  const cookie = useCookie<ThemeMode>(THEME_COOKIE, {
    default: () => THEME_DEFAULT,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  const mode = computed<ThemeMode>({
    get: () => cookie.value || THEME_DEFAULT,
    set: (next) => { cookie.value = next },
  })

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  const resolved = computed<ResolvedTheme>(() => resolveTheme(mode.value, prefersDark.value))

  // Apply to <html> on the client whenever resolved changes
  if (import.meta.client) {
    watchEffect(() => {
      document.documentElement.setAttribute('data-theme', resolved.value)
    })
  }

  function setMode(next: ThemeMode) {
    mode.value = next
  }

  function cycle() {
    const order: ThemeMode[] = ['auto', 'light', 'dark']
    const i = order.indexOf(mode.value)
    setMode(order[(i + 1) % order.length])
  }

  return { mode, resolved, setMode, cycle }
}
