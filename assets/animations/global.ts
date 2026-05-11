import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false
function ensureRegistered() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
}

export type AnimationController = { destroy(): void }

const emptyCtrl: AnimationController = { destroy() {} }

function reducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Image reveal — elements with `.img-reveal` get a clip-path reveal as they
 * enter the viewport. The reveal is masked from bottom to top.
 *
 * Usage:
 *   <div class="img-reveal"><img src="..."></div>
 */
export function bootImageReveals(root: Document | HTMLElement = document): AnimationController {
  if (typeof window === 'undefined') return emptyCtrl
  ensureRegistered()

  if (reducedMotion()) {
    root.querySelectorAll<HTMLElement>('.img-reveal').forEach(el => {
      el.style.clipPath = 'inset(0 0 0 0)'
    })
    return emptyCtrl
  }

  const triggers: ScrollTrigger[] = []
  root.querySelectorAll<HTMLElement>('.img-reveal').forEach(el => {
    gsap.set(el, { clipPath: 'inset(0 0 100% 0)' })
    const tw = gsap.to(el, {
      clipPath: 'inset(0 0 0% 0)',
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })
    const st = tw.scrollTrigger
    if (st) triggers.push(st)
  })
  return { destroy() { triggers.forEach(t => t.kill()) } }
}

/**
 * Number count-up — elements with `[data-count]` animate from 0 to their
 * numeric content when entering the viewport. Preserves prefix/suffix.
 *
 * Usage:
 *   <span data-count>+240%</span>
 *   <span data-count>12,000</span>
 *   <span data-count="3.5">3,5</span>   (override numeric end)
 */
export function bootCounters(root: Document | HTMLElement = document): AnimationController {
  if (typeof window === 'undefined') return emptyCtrl
  ensureRegistered()
  if (reducedMotion()) return emptyCtrl

  const triggers: ScrollTrigger[] = []
  root.querySelectorAll<HTMLElement>('[data-count]').forEach(el => {
    const raw = (el.dataset.count?.length ? el.dataset.count : el.textContent || '').trim()
    const match = raw.replace(/[\s,_]/g, '').match(/-?\d+(?:\.\d+)?/)
    if (!match) return

    const target = parseFloat(match[0])
    const prefix = raw.slice(0, raw.indexOf(match[0])).replace(/[0-9]/g, '')
    const suffix = raw.slice(raw.indexOf(match[0]) + match[0].length)
    const decimals = (match[0].split('.')[1] || '').length
    const localeFmt = new Intl.NumberFormat(
      document.documentElement.lang === 'en' ? 'en-US' : 'fr-FR',
      { minimumFractionDigits: decimals, maximumFractionDigits: decimals },
    )

    const obj = { v: 0 }
    const tw = gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = `${prefix}${localeFmt.format(obj.v)}${suffix}`
      },
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    })
    const st = tw.scrollTrigger
    if (st) triggers.push(st)
  })
  return { destroy() { triggers.forEach(t => t.kill()) } }
}

/**
 * Parallax — elements with `[data-parallax]` translate as they scroll
 * through the viewport. Factor 0.1 = subtle, 0.3 = strong.
 */
export function bootParallax(root: Document | HTMLElement = document): AnimationController {
  if (typeof window === 'undefined') return emptyCtrl
  ensureRegistered()
  if (reducedMotion()) return emptyCtrl

  const triggers: ScrollTrigger[] = []
  root.querySelectorAll<HTMLElement>('[data-parallax]').forEach(el => {
    const factor = parseFloat(el.dataset.parallax || '0.1')
    const tw = gsap.to(el, {
      yPercent: -100 * factor,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
    const st = tw.scrollTrigger
    if (st) triggers.push(st)
  })
  return { destroy() { triggers.forEach(t => t.kill()) } }
}

/**
 * Generic stagger reveal — elements with `[data-stagger]` reveal their
 * children in order. Children selector defaults to `> *`.
 *
 * Usage:
 *   <ul data-stagger>
 *     <li>...</li>
 *   </ul>
 */
export function bootStaggerReveals(root: Document | HTMLElement = document): AnimationController {
  if (typeof window === 'undefined') return emptyCtrl
  ensureRegistered()

  if (reducedMotion()) {
    root.querySelectorAll<HTMLElement>('[data-stagger]').forEach(el => {
      el.querySelectorAll<HTMLElement>(':scope > *').forEach(c => {
        c.style.opacity = '1'; c.style.transform = 'none'
      })
    })
    return emptyCtrl
  }

  const triggers: ScrollTrigger[] = []
  root.querySelectorAll<HTMLElement>('[data-stagger]').forEach(el => {
    const children = el.querySelectorAll<HTMLElement>(':scope > *')
    gsap.set(children, { opacity: 0, y: 24 })
    const tw = gsap.to(children, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })
    const st = tw.scrollTrigger
    if (st) triggers.push(st)
  })
  return { destroy() { triggers.forEach(t => t.kill()) } }
}

/**
 * Boot all global scroll animations at once.
 * Returns a single controller that kills everything when destroyed.
 */
export function bootGlobalAnimations(root: Document | HTMLElement = document): AnimationController {
  if (typeof window === 'undefined') return emptyCtrl
  const ctrls = [
    bootImageReveals(root),
    bootCounters(root),
    bootParallax(root),
    bootStaggerReveals(root),
  ]
  return {
    destroy() { ctrls.forEach(c => c.destroy()) },
  }
}
