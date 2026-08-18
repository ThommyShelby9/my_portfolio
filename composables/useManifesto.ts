import { ref, type Ref } from 'vue'
import { computeEngulf, computeFeed, clamp } from '~/assets/manifesto/engulf'

/**
 * The single scroll owner for the "engulf" home. Drives one rAF-throttled
 * scroll loop that pulls `[data-eat]` blocks into the black hole and writes
 * `--feed` / `--progress` / `--void-recede` on `:root` for the fixed
 * `GargantuaStage` (and any other CSS) to read.
 *
 * `start()` is a no-op under `prefers-reduced-motion: reduce` — content
 * stays static and no listeners are attached. `stop()` fully tears down:
 * both listeners, the pending rAF, the inline styles set on eat blocks, and
 * the three custom properties on `:root`.
 */
export function useManifesto(opts: { eatSelector?: string } = {}) {
  const eatSelector = opts.eatSelector ?? '[data-eat]'
  const progress = ref(0)
  const feed = ref(0)
  const activeScene = ref(0)

  let eats: HTMLElement[] = []
  let raf = 0
  let ticking = false
  let running = false
  const root = () => document.documentElement

  function frame() {
    ticking = false
    if (document.hidden) return
    const vh = window.innerHeight
    const holeC = 0.33 * vh
    let f = 0
    let nearest = 0
    let nearestDist = Infinity
    for (let i = 0; i < eats.length; i++) {
      const el = eats[i]
      const r = el.getBoundingClientRect()
      const c = r.top + r.height / 2
      const dist = c - holeC
      const e = computeEngulf(dist, vh)
      el.style.transform = `translateY(${e.shift.toFixed(1)}px) scale(${e.scale.toFixed(3)}) rotate(${e.rotate.toFixed(1)}deg)`
      el.style.opacity = e.opacity.toFixed(3)
      el.style.filter = e.blur > 0.25 ? `blur(${e.blur.toFixed(1)}px)` : 'none'
      f = Math.max(f, computeFeed(dist, vh))
      if (Math.abs(dist) < nearestDist) { nearestDist = Math.abs(dist); nearest = i }
    }
    const scrolled = window.scrollY
    const max = Math.max(1, document.documentElement.scrollHeight - vh)
    const p = clamp(scrolled / max, 0, 1)
    feed.value = f
    progress.value = p
    activeScene.value = nearest
    root().style.setProperty('--feed', f.toFixed(3))
    root().style.setProperty('--progress', p.toFixed(4))
    root().style.setProperty('--void-recede', clamp((p - 0.9) / 0.1, 0, 1).toFixed(3))
  }

  function onScroll() {
    if (document.hidden || !running) return
    if (!ticking) { raf = requestAnimationFrame(frame); ticking = true }
  }

  function start() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    running = true
    eats = Array.from(document.querySelectorAll<HTMLElement>(eatSelector))
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    frame()
  }

  function stop() {
    running = false
    removeEventListener('scroll', onScroll)
    removeEventListener('resize', onScroll)
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    ticking = false
    for (const el of eats) { el.style.transform = ''; el.style.opacity = ''; el.style.filter = '' }
    eats = []
    root().style.removeProperty('--feed')
    root().style.removeProperty('--progress')
    root().style.removeProperty('--void-recede')
  }

  return { progress, feed, activeScene, start, stop } as {
    progress: Ref<number>
    feed: Ref<number>
    activeScene: Ref<number>
    start(): void
    stop(): void
  }
}
