<script setup lang="ts">
// Custom cursor — only on desktop with fine pointer.
// Two layers: a delayed aura (eases toward pointer) and a precise dot.
const aura = ref<HTMLElement | null>(null)
const dot = ref<HTMLElement | null>(null)
const label = ref('')
const variant = ref<'idle' | 'hover' | 'text'>('idle')
const enabled = ref(false)

let raf = 0
const mouse = { x: 0, y: 0 }
const auraPos = { x: 0, y: 0 }

function tick() {
  // Lerp aura toward mouse
  auraPos.x += (mouse.x - auraPos.x) * 0.18
  auraPos.y += (mouse.y - auraPos.y) * 0.18
  if (aura.value) {
    aura.value.style.transform = `translate3d(${auraPos.x}px, ${auraPos.y}px, 0) translate(-50%, -50%)`
  }
  if (dot.value) {
    dot.value.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`
  }
  raf = requestAnimationFrame(tick)
}

function onMove(e: MouseEvent) {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

function onOver(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  if (!target) return
  const interactive = target.closest('a, button, [role="button"], input, textarea, select, label')
  const cursorEl = target.closest('[data-cursor]') as HTMLElement | null

  if (cursorEl?.dataset.cursor === 'text') {
    label.value = cursorEl.dataset.cursorLabel || 'view'
    variant.value = 'text'
    return
  }
  if (interactive || cursorEl) {
    variant.value = 'hover'
    label.value = ''
    return
  }
  variant.value = 'idle'
  label.value = ''
}

function checkSupport() {
  if (typeof window === 'undefined') return false
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return fine && !reduce
}

onMounted(() => {
  if (!checkSupport()) return
  enabled.value = true
  document.documentElement.classList.add('has-cursor')

  // Init position to center
  mouse.x = window.innerWidth / 2
  mouse.y = window.innerHeight / 2
  auraPos.x = mouse.x
  auraPos.y = mouse.y

  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('mouseover', onOver, { passive: true })
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseover', onOver)
  document.documentElement.classList.remove('has-cursor')
})
</script>

<template>
  <ClientOnly>
    <div
      v-if="enabled"
      ref="aura"
      :class="['cursor-aura', `cursor-aura--${variant}`]"
      :data-label="label"
      aria-hidden="true"
    />
    <div v-if="enabled" ref="dot" class="cursor-dot" aria-hidden="true" />
  </ClientOnly>
</template>
