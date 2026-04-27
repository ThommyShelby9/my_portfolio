import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

function ensureRegistered() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
}

export type FadeUpOptions = {
  delay?: number
  duration?: number
  y?: number
  start?: string
}

export function fadeUp(target: Element, opts: FadeUpOptions = {}) {
  ensureRegistered()
  return gsap.fromTo(
    target,
    { opacity: 0, y: opts.y ?? 16 },
    {
      opacity: 1,
      y: 0,
      duration: opts.duration ?? 0.8,
      delay: opts.delay ?? 0,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: target,
        start: opts.start ?? 'top 85%',
        toggleActions: 'play none none none',
      },
    },
  )
}
