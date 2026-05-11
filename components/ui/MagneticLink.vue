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

const el = ref<HTMLElement | null>(null)
let raf = 0
const current = { x: 0, y: 0 }
const target = { x: 0, y: 0 }

function onMove(e: MouseEvent) {
  if (!el.value) return
  const rect = el.value.getBoundingClientRect()
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
  if (el.value) {
    el.value.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`
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
  <NuxtLink v-if="props.to" ref="el" :to="props.to" :aria-label="ariaLabel">
    <slot />
  </NuxtLink>
  <a v-else-if="props.href" ref="el" :href="props.href" :aria-label="ariaLabel">
    <slot />
  </a>
  <button v-else ref="el" :type="props.type" :aria-label="ariaLabel">
    <slot />
  </button>
</template>
