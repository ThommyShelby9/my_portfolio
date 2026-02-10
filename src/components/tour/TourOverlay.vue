<template>
  <Teleport to="body">
    <Transition name="tour-fade">
      <div v-if="tourStore.isActive && currentStep" class="tour-overlay" @click.self="handleSkip">
        <!-- SVG Spotlight Mask -->
        <svg class="spotlight-mask">
          <defs>
            <mask id="spotlight-mask">
              <!-- White background (visible) -->
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <!-- Black cutout (transparent) for highlighted element -->
              <rect
                v-if="highlightBounds"
                :x="highlightBounds.x"
                :y="highlightBounds.y"
                :width="highlightBounds.width"
                :height="highlightBounds.height"
                :rx="highlightBounds.radius"
                fill="black"
              />
            </mask>
          </defs>
          <!-- Apply mask to darken everything except spotlight -->
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        <!-- Highlight Border with Pulse Animation -->
        <div
          v-if="highlightBounds"
          class="highlight-border"
          :style="highlightStyle"
        ></div>

        <!-- Tour Tooltip -->
        <TourTooltip
          :title="currentStep.title"
          :description="currentStep.description"
          :tips="currentStep.tips"
          :position="currentStep.position"
          :current-step="tourStore.currentStepIndex"
          :total-steps="tourStore.totalSteps"
          :progress="tourStore.progress"
          :is-first-step="tourStore.isFirstStep"
          :is-last-step="tourStore.isLastStep"
          @next="handleNext"
          @prev="handlePrev"
          @skip="handleSkip"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useTourStore } from '@/stores/tour'
import TourTooltip from './TourTooltip.vue'

const tourStore = useTourStore()

interface HighlightBounds {
  x: number
  y: number
  width: number
  height: number
  radius: number
}

const highlightBounds = ref<HighlightBounds | null>(null)

const currentStep = computed(() => tourStore.currentStep)

// Computed style for highlight border
const highlightStyle = computed(() => {
  if (!highlightBounds.value) return {}

  const bounds = highlightBounds.value
  return {
    left: `${bounds.x}px`,
    top: `${bounds.y}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
    borderRadius: `${bounds.radius}px`
  }
})

/**
 * Update highlight position based on current step's target
 */
function updateHighlight() {
  console.log('🎯 Updating highlight for step:', currentStep.value?.title)

  if (!currentStep.value?.target) {
    console.log('⚠️ No target for this step')
    highlightBounds.value = null
    return
  }

  console.log('🔍 Looking for element:', currentStep.value.target)
  const element = document.querySelector(currentStep.value.target)

  if (!element) {
    console.error('❌ Element not found:', currentStep.value.target)
    highlightBounds.value = null
    return
  }

  console.log('✅ Element found!', element)

  // Check if element is actually visible
  const style = window.getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    console.warn('⚠️ Element is hidden (display:none or visibility:hidden)')
    highlightBounds.value = null
    return
  }

  const rect = element.getBoundingClientRect()

  // Check if element has actual dimensions
  if (rect.width === 0 || rect.height === 0) {
    console.warn('⚠️ Element has no dimensions')
    highlightBounds.value = null
    return
  }

  const padding = 8 // Extra space around element

  highlightBounds.value = {
    x: rect.left - padding,
    y: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
    radius: 8
  }

  console.log('📐 Highlight bounds:', highlightBounds.value)
}

/**
 * Handle next step
 */
function handleNext() {
  tourStore.nextStep()
}

/**
 * Handle previous step
 */
function handlePrev() {
  tourStore.prevStep()
}

/**
 * Handle skip tour
 */
function handleSkip() {
  tourStore.skipTour()
}

/**
 * Handle escape key to skip tour
 */
function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && tourStore.isActive) {
    handleSkip()
  }
}

// Watch for step changes and update highlight
watch(() => tourStore.currentStepIndex, async () => {
  // Only update if tour is active
  if (!tourStore.isActive) return

  await nextTick()
  updateHighlight()

  // Execute step action if defined
  if (currentStep.value?.action) {
    currentStep.value.action()
  }
})

// Watch for tour activation to show first step
watch(() => tourStore.isActive, async (active) => {
  if (active) {
    await nextTick()
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      updateHighlight()
    }, 100)
  }
})

// Watch for window resize and update highlight
let resizeTimeout: number | null = null
function handleResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  resizeTimeout = window.setTimeout(() => {
    updateHighlight()
  }, 100) as unknown as number
}

// Setup event listeners
onMounted(() => {
  window.addEventListener('keydown', handleEscape)
  window.addEventListener('resize', handleResize)

  // Initial highlight update
  if (tourStore.isActive) {
    nextTick(() => updateHighlight())
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', handleResize)
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
})
</script>

<style scoped>
.tour-overlay {
  @apply fixed inset-0 z-[10001];
  @apply overflow-hidden;
}

/* SVG Spotlight Mask */
.spotlight-mask {
  @apply absolute inset-0;
  @apply w-full h-full;
  @apply pointer-events-none;
}

/* Highlight Border with Pulse Animation */
.highlight-border {
  @apply absolute;
  @apply border-2 border-theme-accent;
  @apply pointer-events-none;
  @apply transition-all duration-300 ease-out;
  box-shadow: 0 0 20px rgba(0, 255, 247, 0.6);
  animation: pulse-border 2s ease-in-out infinite;
}

@keyframes pulse-border {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 255, 247, 0.6);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 255, 247, 0.9);
  }
}

/* Transitions */
.tour-fade-enter-active,
.tour-fade-leave-active {
  transition: opacity 0.3s ease;
}

.tour-fade-enter-from,
.tour-fade-leave-to {
  opacity: 0;
}

.tour-fade-enter-active .highlight-border,
.tour-fade-leave-active .highlight-border {
  transition: all 0.3s ease;
}

.tour-fade-enter-from .highlight-border,
.tour-fade-leave-to .highlight-border {
  opacity: 0;
  transform: scale(0.9);
}
</style>
