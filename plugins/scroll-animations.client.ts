import { bootGlobalAnimations, type AnimationController } from '~/assets/animations/global'

/**
 * Re-boots global scroll animations after each navigation.
 * Lifecycle:
 *  - app:mounted: boot once on initial load
 *  - page:finish: kill previous controller + reboot after DOM settles
 *
 * Animations covered (see assets/animations/global.ts):
 *  - .img-reveal       — clip-path bottom-to-top reveal on enter
 *  - [data-count]      — number count-up
 *  - [data-parallax]   — scroll-scrubbed translate
 *  - [data-stagger]    — staggered child reveal
 */
export default defineNuxtPlugin((nuxtApp) => {
  let ctrl: AnimationController | null = null

  function reboot() {
    ctrl?.destroy()
    // Wait one frame for the new page DOM to settle.
    requestAnimationFrame(() => {
      ctrl = bootGlobalAnimations()
    })
  }

  nuxtApp.hook('app:mounted', () => {
    reboot()
  })

  nuxtApp.hook('page:finish', () => {
    reboot()
  })
})
