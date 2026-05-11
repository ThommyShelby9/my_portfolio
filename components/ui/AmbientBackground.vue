<script setup lang="ts">
// Halo follows mouse + grain overlay. Both purely decorative.
const halo = ref<HTMLElement | null>(null)
let raf = 0
const target = { x: 50, y: 30 } // percent
const current = { x: 50, y: 30 }

function onMove(e: MouseEvent) {
  target.x = (e.clientX / window.innerWidth) * 100
  target.y = (e.clientY / window.innerHeight) * 100
}

function tick() {
  current.x += (target.x - current.x) * 0.04
  current.y += (target.y - current.y) * 0.04
  if (halo.value) {
    halo.value.style.setProperty('--mx', `${current.x}%`)
    halo.value.style.setProperty('--my', `${current.y}%`)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  if (typeof window === 'undefined') return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return
  window.addEventListener('mousemove', onMove, { passive: true })
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('mousemove', onMove)
})
</script>

<template>
  <div ref="halo" class="bg-halo" aria-hidden="true" />
  <div class="bg-grain" aria-hidden="true" />
</template>
