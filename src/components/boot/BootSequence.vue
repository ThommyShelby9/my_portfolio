<template>
  <div v-if="isBooting" class="boot-overlay">
    <!-- Animated scan lines -->
    <div class="scan-lines"></div>

    <!-- Vignette effect -->
    <div class="vignette"></div>

    <div class="boot-content">
      <!-- Logo with glow -->
      <div class="logo-container">
        <h1 ref="logoRef" class="boot-logo">ROSTEL_OS</h1>
        <div ref="logoGlowRef" class="logo-glow"></div>
      </div>

      <!-- Version -->
      <p ref="versionRef" class="boot-version">v4.5.0 — NEURAL INTERFACE</p>

      <!-- Boot logs -->
      <div class="boot-logs">
        <div
          v-for="(log, index) in bootLogs"
          :key="index"
          :ref="el => { if (el) logsRef[index] = el as HTMLElement }"
          class="boot-log"
          :class="`boot-log-${log.status}`"
        >
          <span class="log-icon">{{ log.icon }}</span>
          <span class="log-text">{{ log.text }}</span>
          <span class="log-cursor">_</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div ref="progressBarRef" class="boot-progress">
        <div ref="progressFillRef" class="progress-bar"></div>
        <div class="progress-glow"></div>
      </div>

      <!-- Skip button -->
      <button
        class="boot-skip"
        @click="skipBoot"
        aria-label="Skip boot sequence"
      >
        <span class="skip-bracket">[</span>
        <span class="skip-text">PRESS ANY KEY TO SKIP</span>
        <span class="skip-bracket">]</span>
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
const logoGlowRef = ref<HTMLElement>()
const versionRef = ref<HTMLElement>()
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

  const tl = gsap.timeline()
  bootTimeline = tl

  // 1. Logo dramatic entrance with scale + rotation (0.8s)
  tl.from(logoRef.value, {
    opacity: 0,
    scale: 0.5,
    rotationX: -90,
    duration: 0.8,
    ease: 'back.out(1.7)'
  })

  // Logo glow pulse
  if (logoGlowRef.value) {
    tl.from(logoGlowRef.value, {
      opacity: 0,
      scale: 0.5,
      duration: 0.8,
      ease: 'back.out(1.7)'
    }, '<')

    tl.to(logoGlowRef.value, {
      scale: 1.2,
      opacity: 0.8,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }

  // 2. Enhanced glitch effect (0.4s)
  tl.to(logoRef.value, {
    x: () => Math.random() * 15 - 7.5,
    skewX: () => Math.random() * 10 - 5,
    duration: 0.05,
    repeat: 7,
    yoyo: true,
    ease: 'none'
  })
  tl.to(logoRef.value, { x: 0, skewX: 0, duration: 0.1 })

  // 3. Version appear with typing effect
  if (versionRef.value) {
    tl.from(versionRef.value, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: 'power2.out'
    })
  }

  // 4. Wait a bit
  tl.to({}, { duration: 0.2 })

  // 5. Logs appear with typing + glow effect
  logsRef.value.forEach((logEl, index) => {
    if (logEl) {
      const logIcon = logEl.querySelector('.log-icon')
      const logCursor = logEl.querySelector('.log-cursor')

      // Log container fades in
      tl.from(logEl, {
        opacity: 0,
        x: -30,
        duration: 0.15,
        ease: 'power2.out'
      }, index * 0.2)

      // Icon flash effect
      if (logIcon) {
        tl.from(logIcon, {
          scale: 0,
          rotation: 180,
          duration: 0.2,
          ease: 'back.out(2)'
        }, '<')

        tl.to(logIcon, {
          textShadow: '0 0 10px rgba(34, 197, 94, 0.8)',
          duration: 0.1,
          yoyo: true,
          repeat: 1
        }, '<')
      }

      // Cursor blink during typing
      if (logCursor) {
        tl.fromTo(logCursor,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.1,
            repeat: 3,
            yoyo: true
          },
          '<'
        )
        tl.to(logCursor, { opacity: 0, duration: 0.1 })
      }
    }
  })

  // 6. Progress bar with enhanced effects (1.2s)
  tl.from(progressBarRef.value, {
    opacity: 0,
    scaleX: 0,
    duration: 0.3,
    ease: 'power2.out'
  })

  tl.to(progressFillRef.value, {
    width: '100%',
    duration: 1.2,
    ease: 'power1.inOut',
    onUpdate: function() {
      // Add random micro-stutters for realism
      if (Math.random() > 0.95 && progressFillRef.value) {
        gsap.to(progressFillRef.value, {
          width: `${parseFloat(progressFillRef.value.style.width) - 1}%`,
          duration: 0.05
        })
      }
    }
  })

  // Progress bar glow pulse
  const progressGlow = progressBarRef.value.querySelector('.progress-glow')
  if (progressGlow) {
    tl.to(progressGlow, {
      opacity: 1,
      duration: 0.3
    }, '<')
  }

  // 7. Calculate remaining time to reach 5 seconds total
  const currentDuration = tl.duration()
  const targetDuration = 5.0 // 5 seconds total
  const fadeOutDuration = 0.5
  const remainingTime = Math.max(0, targetDuration - currentDuration - fadeOutDuration)

  // Wait to reach target duration
  if (remainingTime > 0) {
    tl.to({}, { duration: remainingTime })
  }

  // 8. Final glitch before exit
  tl.to(logoRef.value, {
    x: () => Math.random() * 20 - 10,
    opacity: () => Math.random() * 0.3 + 0.7,
    duration: 0.03,
    repeat: 5,
    yoyo: true,
    ease: 'none'
  })
  tl.to(logoRef.value, { x: 0, opacity: 1, duration: 0.1 })

  // 9. Fade out entire boot content
  tl.to('.boot-content', {
    opacity: 0,
    y: -20,
    duration: fadeOutDuration,
    ease: 'power2.in'
  })

  // Complete boot immediately after content fades
  tl.call(completeBoot)
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
  @apply bg-black;
  @apply flex items-center justify-center;
  @apply overflow-hidden;
  background: radial-gradient(ellipse at center, #0b0f14 0%, #000000 100%);
}

/* Animated scan lines */
.scan-lines {
  @apply absolute inset-0;
  @apply pointer-events-none;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 255, 247, 0.03) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 255, 247, 0.03) 3px
  );
  animation: scan 8s linear infinite;
}

@keyframes scan {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(50px);
  }
}

/* Vignette effect */
.vignette {
  @apply absolute inset-0;
  @apply pointer-events-none;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
}

.boot-content {
  @apply text-center max-w-2xl px-8;
  @apply relative z-10;
}

/* Logo container with glow */
.logo-container {
  @apply relative inline-block mb-2;
}

.boot-logo {
  @apply text-7xl font-bold text-theme-accent;
  @apply font-mono relative z-10;
  text-shadow:
    0 0 10px rgba(0, 255, 247, 0.8),
    0 0 20px rgba(0, 255, 247, 0.6),
    0 0 30px rgba(0, 255, 247, 0.4),
    0 0 40px rgba(0, 255, 247, 0.2);
  letter-spacing: 0.15em;
  font-weight: 900;
}

.logo-glow {
  @apply absolute inset-0;
  @apply blur-2xl;
  @apply bg-theme-accent;
  @apply rounded-full;
  opacity: 0.3;
  z-index: 0;
}

.boot-version {
  @apply text-theme-accent text-xs mb-12 font-mono;
  @apply tracking-widest;
  opacity: 0.7;
  letter-spacing: 0.3em;
}

.boot-logs {
  @apply space-y-3 mb-10 text-left max-w-xl mx-auto;
}

.boot-log {
  @apply flex items-center gap-3 font-mono text-sm;
  @apply relative;
  opacity: 0;
  padding: 8px 12px;
  background: rgba(0, 255, 247, 0.02);
  border-left: 2px solid transparent;
  transition: all 0.3s ease;
}

.boot-log:hover {
  background: rgba(0, 255, 247, 0.05);
  border-left-color: rgba(0, 255, 247, 0.5);
}

.log-icon {
  @apply flex-shrink-0;
  @apply text-lg;
  font-weight: bold;
}

.log-text {
  @apply text-theme-primary flex-1;
  @apply tracking-wide;
}

.log-cursor {
  @apply text-theme-accent;
  @apply ml-1;
  font-weight: bold;
  opacity: 0;
}

.boot-log-success .log-icon {
  @apply text-success;
  filter: drop-shadow(0 0 3px rgba(34, 197, 94, 0.5));
}

.boot-log-error .log-icon {
  @apply text-error;
  filter: drop-shadow(0 0 3px rgba(239, 68, 68, 0.5));
}

/* Progress bar */
.boot-progress {
  @apply w-full max-w-md mx-auto h-2 bg-theme-secondary rounded-full;
  @apply mb-10 relative;
  @apply overflow-visible;
  opacity: 0;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.progress-bar {
  @apply h-full rounded-full relative;
  width: 0%;
  background: linear-gradient(
    to right,
    var(--color-accent-dark),
    var(--color-accent),
    var(--color-accent)
  );
  background-size: 200% 100%;
  box-shadow:
    0 0 10px rgba(0, 255, 247, 0.5),
    0 0 20px rgba(0, 255, 247, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: progress-shimmer 2s linear infinite;
}

@keyframes progress-shimmer {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.progress-glow {
  @apply absolute inset-0 rounded-full;
  @apply blur-md;
  background: rgba(0, 255, 247, 0.4);
  opacity: 0;
  pointer-events: none;
}

/* Skip button */
.boot-skip {
  @apply text-theme-secondary text-xs font-mono;
  @apply hover:text-theme-accent transition-all duration-300;
  @apply border-none bg-transparent cursor-pointer;
  @apply flex items-center gap-2 mx-auto;
  animation: pulse-text 2s ease-in-out infinite;
  letter-spacing: 0.1em;
}

.boot-skip:hover {
  text-shadow: 0 0 10px rgba(0, 255, 247, 0.5);
  transform: scale(1.05);
}

.skip-bracket {
  @apply text-theme-accent;
  font-weight: bold;
}

.skip-text {
  @apply text-theme-secondary;
}

@keyframes pulse-text {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .boot-logo {
    @apply text-5xl;
  }

  .boot-version {
    @apply text-[10px] mb-8;
  }

  .boot-logs {
    @apply text-xs space-y-2 mb-8;
  }

  .boot-log {
    padding: 6px 10px;
  }

  .boot-progress {
    @apply mb-8;
  }
}
</style>
