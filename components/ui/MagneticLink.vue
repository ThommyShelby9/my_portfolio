<script setup lang="ts">
// Magnetic button/link — attracts toward pointer within a radius.
// Auto-resolves to NuxtLink if `to` provided, else <button>.
const props = withDefaults(defineProps<{
  to?: string
  href?: string
  strength?: number
  radius?: number
  type?: 'button' | 'submit'
  ariaLabel?: string
}>(), {
  strength: 0.35,
  radius: 100,
  type: 'button',
})

// When the template ref is bound to <NuxtLink>, Vue gives us the component
// instance, not the raw HTMLElement. Unwrap via `$el` so the magnetic math
// (getBoundingClientRect + style.transform) always runs on a real element.
const elRef = ref<HTMLElement | any | null>(null)
function getEl(): HTMLElement | null {
  const r = elRef.value
  if (!r) return null
  // HTMLElement: return as-is. Component instance: walk to its root DOM node.
  return (r instanceof HTMLElement) ? r : ((r as any).$el as HTMLElement) ?? null
}

let raf = 0
const current = { x: 0, y: 0 }
const target = { x: 0, y: 0 }

function onMove(e: MouseEvent) {
  const el = getEl()
  if (!el) return
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = e.clientX - cx
  const dy = e.clientY - cy
  const dist = Math.hypot(dx, dy)
  if (dist > props.radius) {
    target.x = 0
    target.y = 0
  } else {
    target.x = dx * props.strength
    target.y = dy * props.strength
  }
}

function tick() {
  current.x += (target.x - current.x) * 0.18
  current.y += (target.y - current.y) * 0.18
  const el = getEl()
  if (el && el.style) {
    el.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`
  }
  raf = requestAnimationFrame(tick)
}

function reset() {
  target.x = 0
  target.y = 0
}

onMounted(() => {
  if (typeof window === 'undefined') return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  if (reduce || coarse) return
  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('mouseleave', reset)
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseleave', reset)
})
</script>

<template>
  <NuxtLink v-if="props.to" ref="elRef" :to="props.to" :aria-label="ariaLabel">
    <slot />
  </NuxtLink>
  <a v-else-if="props.href" ref="elRef" :href="props.href" :aria-label="ariaLabel">
    <slot />
  </a>
  <button v-else ref="elRef" :type="props.type" :aria-label="ariaLabel">
    <slot />
  </button>
</template>
