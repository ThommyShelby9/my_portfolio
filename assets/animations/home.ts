import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

function ensureRegistered() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
}

export type HomeAnimController = {
  destroy(): void
}

/**
 * Home-page scroll animations.
 *
 * RULE OF THUMB — never call `gsap.from({opacity: 0})` on an element that
 * is ITSELF wrapped in `<RevealOnView>` (i.e. carries `data-reveal`). GSAP
 * would read the CSS-declared opacity (0) as the starting point, animate
 * "0 → 0", and leave a stuck inline `opacity: 0` that outranks the
 * `.is-visible` class. Animating CHILDREN of a reveal-wrapped element is
 * fine — their computed opacity is 1, GSAP animates 0 → 1, transitions
 * compose cleanly.
 */
export function bootHomeAnimations(): HomeAnimController {
  if (typeof window === 'undefined') return { destroy() {} }
  ensureRegistered()

  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Hero title parallax — translate only.
      gsap.utils.toArray<HTMLElement>('.hero__title-line').forEach((el, i) => {
        gsap.to(el, {
          yPercent: -8 * (i + 1),
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        })
      })

      // Hero panel parallax — translate only.
      const panel = document.querySelector('.hero__panel')
      if (panel) {
        gsap.to(panel, {
          yPercent: -16,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })
      }

      // Featured work numbers — child of <li>, no RevealOnView wrap. Safe.
      gsap.utils.toArray<HTMLElement>('.entry__num-val').forEach((el) => {
        gsap.from(el, {
          xPercent: -30,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      // Lab pills — children of lab__group (which IS reveal-wrapped) but the
      // pills themselves are not, so animating them is safe.
      gsap.utils.toArray<HTMLElement>('.lab__group').forEach((group) => {
        const pills = group.querySelectorAll<HTMLElement>('.lab__pill')
        gsap.from(pills, {
          opacity: 0,
          y: 10,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.04,
          scrollTrigger: {
            trigger: group,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        })
      })

      // CTA title <em> — child of the reveal wrapper. Safe.
      const ctaTitle = document.querySelector<HTMLElement>('.cta__title em')
      if (ctaTitle) {
        gsap.fromTo(ctaTitle,
          { rotate: -4, scale: 0.94, opacity: 0 },
          {
            rotate: 0, scale: 1, opacity: 1,
            duration: 1.1, ease: 'elastic.out(1, 0.6)',
            scrollTrigger: {
              trigger: '.cta',
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      }

      // Section heads — animate ONLY the <em> spans, never the wrapper.
      gsap.utils.toArray<HTMLElement>('.featured__title, .approach__title, .lab__title').forEach((el) => {
        gsap.from(el.querySelectorAll('em'), {
          opacity: 0,
          x: 30,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        })
      })

      // NOTE: no animation on .schematic__item — those elements are
      // themselves reveal-wrapped, so RevealOnView handles them alone.
    })

    return () => mm.kill()
  })

  return {
    destroy() {
      ctx.revert()
    },
  }
}

/**
 * Parallax for any element with data-parallax="<factor>" attribute.
 * Factor 0.05 = subtle, 0.2 = strong.
 */
export function bootParallax(root: Document | HTMLElement = document): HomeAnimController {
  if (typeof window === 'undefined') return { destroy() {} }
  ensureRegistered()

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return { destroy() {} }

  const triggers: ScrollTrigger[] = []
  root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const factor = parseFloat(el.dataset.parallax || '0.1')
    const tween = gsap.to(el, {
      yPercent: -100 * factor,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
    const st = tween.scrollTrigger
    if (st) triggers.push(st)
  })

  return {
    destroy() {
      triggers.forEach(t => t.kill())
    },
  }
}
