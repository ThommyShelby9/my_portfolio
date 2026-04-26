<template>
  <canvas
    ref="canvasRef"
    class="grain-effect"
    :class="{ 'grain-visible': visible }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'

const store = useTerminalStore()
const { fxEnabled, reducedMotion } = storeToRefs(store)

const canvasRef = ref<HTMLCanvasElement>()
const visible = ref(true)
let animationFrameId: number | null = null

// Grain configuration
const GRAIN_OPACITY = 0.03

function generateGrain() {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size to window size
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Generate random noise
  const imageData = ctx.createImageData(canvas.width, canvas.height)
  const buffer = new Uint32Array(imageData.data.buffer)

  for (let i = 0; i < buffer.length; i++) {
    if (Math.random() < 0.5) {
      const gray = Math.random() * 255
      buffer[i] = (255 * GRAIN_OPACITY << 24) | (gray << 16) | (gray << 8) | gray
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function animate() {
  if (!fxEnabled.value || reducedMotion.value) {
    visible.value = false
    return
  }

  visible.value = true
  generateGrain()
  animationFrameId = requestAnimationFrame(animate)
}

function handleResize() {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
  }
}

// Watch for FX and reduced motion changes
watch([fxEnabled, reducedMotion], () => {
  if (fxEnabled.value && !reducedMotion.value) {
    animate()
  } else {
    visible.value = false
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
})

onMounted(() => {
  if (fxEnabled.value && !reducedMotion.value) {
    animate()
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.grain-effect {
  @apply fixed inset-0 pointer-events-none z-50;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.grain-visible {
  opacity: 1;
}
</style>
