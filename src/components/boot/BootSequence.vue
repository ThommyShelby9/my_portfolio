<template>
  <div v-if="isBooting" class="boot-overlay">
    <div class="boot-content">
      <!-- Logo -->
      <h1 ref="logoRef" class="boot-logo">ROSTEL_OS</h1>

      <!-- Version -->
      <p class="boot-version">v4.5.0</p>

      <!-- Boot logs -->
      <div class="boot-logs">
        <div
          v-for="(log, index) in bootLogs"
          :key="index"
          ref="logsRef"
          class="boot-log"
          :class="`boot-log-${log.status}`"
        >
          <span class="log-icon">{{ log.icon }}</span>
          <span class="log-text">{{ log.text }}</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div ref="progressBarRef" class="boot-progress">
        <div ref="progressFillRef" class="progress-bar"></div>
      </div>

      <!-- Skip button -->
      <button
        class="boot-skip"
        @click="skipBoot"
        aria-label="Skip boot sequence"
      >
        Press any key to skip...
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTerminalStore } from '@/stores/terminal'
import gsap from 'gsap'

const store = useTerminalStore()

const isBooting = ref(true)
const logoRef = ref<HTMLElement>()
const logsRef = ref<HTMLElement[]>([])
const progressBarRef = ref<HTMLElement>()
const progressFillRef = ref<HTMLElement>()

const bootLogs = [
  { icon: '✓', text: 'Initializing ROSTEL_OS v4.5...', status: 'success' },
  { icon: '✓', text: 'Loading user profile...', status: 'success' },
  { icon: '✓', text: 'Mounting filesystems...', status: 'success' },
  { icon: '✓', text: 'Starting network services...', status: 'success' },
  { icon: '✓', text: 'Loading projects database...', status: 'success' },
  { icon: '✓', text: 'Initializing terminal interface...', status: 'success' },
  { icon: '✓', text: 'System ready.', status: 'success' }
]

let bootTimeline: gsap.core.Timeline | null = null

onMounted(() => {
  createBootSequence()
  // Allow keyboard skip
  window.addEventListener('keydown', skipBoot)
})

onUnmounted(() => {
  window.removeEventListener('keydown', skipBoot)
  if (bootTimeline) {
    bootTimeline.kill()
  }
})

function createBootSequence() {
  if (!logoRef.value || !progressBarRef.value || !progressFillRef.value) {
    completeBoot()
    return
  }

  const tl = gsap.timeline({
    onComplete: completeBoot
  })

  bootTimeline = tl

  // 1. Logo fade in + scale (0.5s)
  tl.from(logoRef.value, {
    opacity: 0,
    scale: 0.8,
    duration: 0.5,
    ease: 'power2.out'
  })

  // 2. Logo glitch effect (0.2s)
  tl.to(logoRef.value, {
    x: () => Math.random() * 10 - 5,
    duration: 0.05,
    repeat: 3,
    yoyo: true,
    ease: 'none'
  })
  tl.to(logoRef.value, { x: 0, duration: 0.1 })

  // 3. Wait a bit
  tl.to({}, { duration: 0.3 })

  // 4. Logs appear sequentially (1.5s total)
  logsRef.value.forEach((logEl, index) => {
    if (logEl) {
      tl.from(logEl, {
        opacity: 0,
        x: -20,
        duration: 0.2,
        ease: 'power2.out'
      }, index * 0.15)
    }
  })

  // 5. Progress bar (1s)
  tl.from(progressBarRef.value, {
    opacity: 0,
    duration: 0.2
  })
  tl.to(progressFillRef.value, {
    width: '100%',
    duration: 1,
    ease: 'power1.inOut'
  })

  // 6. Wait a bit
  tl.to({}, { duration: 0.3 })

  // 7. Fade out overlay (0.5s)
  tl.to('.boot-overlay', {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.inOut'
  })
}

function skipBoot() {
  if (bootTimeline) {
    bootTimeline.kill()
  }
  completeBoot()
}

function completeBoot() {
  isBooting.value = false
  store.setBootComplete()
}
</script>

<style scoped>
.boot-overlay {
  @apply fixed inset-0 z-[100];
  @apply bg-theme-primary;
  @apply flex items-center justify-center;
}

.boot-content {
  @apply text-center max-w-2xl px-8;
}

.boot-logo {
  @apply text-6xl font-bold text-theme-accent mb-2;
  @apply font-mono;
  text-shadow: 0 0 30px rgba(0, 255, 247, 0.5);
  letter-spacing: 0.1em;
}

.boot-version {
  @apply text-theme-secondary text-sm mb-8 font-mono;
}

.boot-logs {
  @apply space-y-2 mb-8 text-left max-w-xl mx-auto;
}

.boot-log {
  @apply flex items-center gap-3 font-mono text-sm;
  opacity: 0;
}

.log-icon {
  @apply flex-shrink-0 text-success;
}

.log-text {
  @apply text-theme-primary;
}

.boot-log-success .log-icon {
  @apply text-success;
}

.boot-log-error .log-icon {
  @apply text-error;
}

.boot-progress {
  @apply w-full max-w-md mx-auto h-1 bg-theme-secondary rounded-full overflow-hidden;
  @apply mb-8;
  opacity: 0;
}

.progress-bar {
  @apply h-full bg-gradient-to-r from-cyan-dark to-cyan-neon rounded-full;
  width: 0%;
}

.boot-skip {
  @apply text-theme-secondary text-xs font-mono;
  @apply hover:text-theme-accent transition-colors;
  @apply border-none bg-transparent cursor-pointer;
  animation: pulse-text 2s ease-in-out infinite;
}

@keyframes pulse-text {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
