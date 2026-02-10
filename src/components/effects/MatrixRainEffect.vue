<template>
  <div v-if="isActive" class="matrix-rain-overlay" @click="stop">
    <canvas ref="canvasRef" class="matrix-canvas" />
    <div class="matrix-controls">
      <button @click.stop="stop" class="matrix-stop-btn">
        Press ESC or Click to Exit
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'

const store = useTerminalStore()
const { reducedMotion } = storeToRefs(store)

const canvasRef = ref<HTMLCanvasElement>()
const isActive = ref(false)
let animationFrameId: number | null = null
let autoStopTimeout: ReturnType<typeof setTimeout> | null = null

// Matrix characters (Japanese katakana + numbers)
const MATRIX_CHARS = 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶヷヸヹヺ0123456789'

// Drop configuration
interface Drop {
  x: number
  y: number
  speed: number
  length: number
  chars: string[]
}

let drops: Drop[] = []
let fontSize = 16
let columns = 0

function initMatrix() {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  fontSize = 16
  columns = Math.floor(canvas.width / fontSize)

  // Initialize drops
  drops = []
  for (let i = 0; i < columns; i++) {
    drops.push({
      x: i * fontSize,
      y: Math.random() * -canvas.height,
      speed: Math.random() * 3 + 2,
      length: Math.floor(Math.random() * 20) + 10,
      chars: []
    })

    // Initialize characters for this drop
    for (let j = 0; j < drops[i].length; j++) {
      drops[i].chars.push(
        MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
      )
    }
  }
}

function drawMatrix() {
  if (!canvasRef.value) return
  if (reducedMotion.value) {
    stop()
    return
  }

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Fade effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw drops
  ctx.font = `${fontSize}px monospace`

  drops.forEach((drop) => {
    // Draw each character in the drop
    for (let j = 0; j < drop.chars.length; j++) {
      const y = drop.y + j * fontSize

      // Skip if outside canvas
      if (y < 0 || y > canvas.height) continue

      // Calculate opacity (brightest at head)
      const opacity = j === 0 ? 1 : 1 - (j / drop.chars.length)

      // Head character is brightest white/green
      if (j === 0) {
        ctx.fillStyle = '#fff'
      } else {
        ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`
      }

      ctx.fillText(drop.chars[j], drop.x, y)

      // Randomly change character
      if (Math.random() > 0.95) {
        drop.chars[j] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
      }
    }

    // Move drop down
    drop.y += drop.speed

    // Reset drop if it's fully off screen
    if (drop.y - drop.chars.length * fontSize > canvas.height) {
      drop.y = Math.random() * -200
      drop.speed = Math.random() * 3 + 2
      drop.length = Math.floor(Math.random() * 20) + 10
      drop.chars = []
      for (let j = 0; j < drop.length; j++) {
        drop.chars.push(
          MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
        )
      }
    }
  })

  animationFrameId = requestAnimationFrame(drawMatrix)
}

function start() {
  if (reducedMotion.value) return

  isActive.value = true

  setTimeout(() => {
    initMatrix()
    drawMatrix()

    // Auto-stop after 30 seconds
    autoStopTimeout = setTimeout(stop, 30000)
  }, 100)
}

function stop() {
  isActive.value = false

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  if (autoStopTimeout) {
    clearTimeout(autoStopTimeout)
    autoStopTimeout = null
  }
}

function handleResize() {
  if (isActive.value) {
    initMatrix()
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isActive.value) {
    stop()
  }
}

// Watch reduced motion
watch(reducedMotion, (isReduced) => {
  if (isReduced && isActive.value) {
    stop()
  }
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  stop()
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyDown)
})

// Expose start/stop methods
defineExpose({
  start,
  stop,
  isActive
})
</script>

<style scoped>
.matrix-rain-overlay {
  @apply fixed inset-0 z-[100] bg-black;
  cursor: pointer;
}

.matrix-canvas {
  @apply w-full h-full;
}

.matrix-controls {
  @apply absolute bottom-8 left-0 right-0;
  @apply flex justify-center;
}

.matrix-stop-btn {
  @apply px-6 py-3 rounded-lg;
  @apply bg-black/50 border-2 border-green-500;
  @apply text-green-500 font-mono text-sm;
  @apply hover:bg-green-500/10;
  @apply transition-all duration-200;
  @apply backdrop-blur-sm;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Reduce motion: disable animation */
@media (prefers-reduced-motion: reduce) {
  .matrix-stop-btn {
    animation: none;
  }
}
</style>
