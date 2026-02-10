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

// Matrix characters (Japanese katakana + numbers + symbols)
const MATRIX_CHARS = 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶヷヸヹヺ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~'

// Drop configuration
interface Drop {
  x: number
  y: number
  speed: number
  length: number
  chars: string[]
  brightness: number
}

let drops: Drop[] = []
let fontSize = 16
let columns = 0
let glitchTimer = 0

function initMatrix() {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  fontSize = 14
  columns = Math.floor(canvas.width / fontSize)

  // Initialize drops with varied properties
  drops = []
  for (let i = 0; i < columns; i++) {
    const length = Math.floor(Math.random() * 25) + 15
    drops.push({
      x: i * fontSize,
      y: Math.random() * -canvas.height * 1.5,
      speed: Math.random() * 4 + 1.5,
      length,
      chars: [],
      brightness: Math.random() * 0.3 + 0.7
    })

    // Initialize characters for this drop
    for (let j = 0; j < length; j++) {
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

  // Stronger fade effect for more dramatic trails
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Occasional glitch effect
  glitchTimer++
  const isGlitching = glitchTimer % 300 === 0

  // Draw drops
  ctx.font = `bold ${fontSize}px monospace`

  drops.forEach((drop, dropIndex) => {
    // Draw each character in the drop
    for (let j = 0; j < drop.chars.length; j++) {
      const y = drop.y + j * fontSize

      // Skip if outside canvas
      if (y < 0 || y > canvas.height + fontSize) continue

      // Calculate opacity with non-linear falloff
      const fadeRatio = j / drop.chars.length
      const opacity = j === 0 ? 1 : Math.pow(1 - fadeRatio, 1.5) * drop.brightness

      // Enhanced head glow effect
      if (j === 0) {
        // Outer glow
        ctx.shadowBlur = 15
        ctx.shadowColor = '#00ff00'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(drop.chars[j], drop.x, y)

        // Reset shadow for other chars
        ctx.shadowBlur = 0
      } else if (j === 1) {
        // Second character with slight glow
        ctx.shadowBlur = 8
        ctx.shadowColor = '#00ff00'
        ctx.fillStyle = `rgba(150, 255, 150, ${opacity})`
        ctx.fillText(drop.chars[j], drop.x, y)
        ctx.shadowBlur = 0
      } else {
        // Regular trail characters
        const green = Math.floor(155 + 100 * opacity)
        ctx.fillStyle = `rgba(0, ${green}, 0, ${opacity})`
        ctx.fillText(drop.chars[j], drop.x, y)
      }

      // Glitch effect
      if (isGlitching && dropIndex % 5 === 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${opacity * 0.3})`
        ctx.fillText(drop.chars[j], drop.x + (Math.random() - 0.5) * 3, y)
      }

      // More frequent character changes for more dynamism
      if (Math.random() > 0.92) {
        drop.chars[j] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
      }
    }

    // Move drop down with slight variation
    drop.y += drop.speed

    // Reset drop if it's fully off screen
    if (drop.y - drop.chars.length * fontSize > canvas.height) {
      const newLength = Math.floor(Math.random() * 25) + 15
      drop.y = Math.random() * -300
      drop.speed = Math.random() * 4 + 1.5
      drop.length = newLength
      drop.brightness = Math.random() * 0.3 + 0.7
      drop.chars = []
      for (let j = 0; j < newLength; j++) {
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
