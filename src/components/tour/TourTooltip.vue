<template>
  <div class="tour-tooltip" :class="`position-${position}`">
    <!-- Progress Bar -->
    <div class="tooltip-progress">
      <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
    </div>

    <!-- Content -->
    <div class="tooltip-content">
      <!-- Close Button -->
      <button class="close-btn" @click="$emit('skip')" aria-label="Close tour">
        ✕
      </button>

      <!-- Title -->
      <h3 class="tooltip-title">{{ title }}</h3>

      <!-- Description -->
      <p class="tooltip-description">{{ description }}</p>

      <!-- Tips -->
      <div v-if="tips && tips.length > 0" class="tooltip-tips">
        <div class="tips-title">💡 Tips:</div>
        <ul class="tips-list">
          <li v-for="(tip, index) in tips" :key="index">{{ tip }}</li>
        </ul>
      </div>

      <!-- Footer with Navigation -->
      <div class="tooltip-footer">
        <!-- Step Counter -->
        <div class="step-counter">
          Step {{ currentStep + 1 }} of {{ totalSteps }}
        </div>

        <!-- Navigation Buttons -->
        <div class="nav-buttons">
          <!-- Skip Button (only on first step) -->
          <button
            v-if="isFirstStep"
            class="btn-skip"
            @click="$emit('skip')"
          >
            Skip Tour
          </button>

          <!-- Back Button -->
          <button
            v-if="!isFirstStep"
            class="btn-back"
            @click="$emit('prev')"
          >
            Back
          </button>

          <!-- Next/Finish Button -->
          <button
            class="btn-next"
            @click="$emit('next')"
          >
            {{ isLastStep ? 'Finish' : 'Next' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TooltipPosition } from '@/types/tour'

interface Props {
  title: string
  description: string
  tips?: string[]
  position: TooltipPosition
  currentStep: number
  totalSteps: number
  progress: number
  isFirstStep: boolean
  isLastStep: boolean
}

defineProps<Props>()

defineEmits<{
  next: []
  prev: []
  skip: []
}>()
</script>

<style scoped>
.tour-tooltip {
  @apply fixed z-[10002];
  @apply bg-theme-secondary;
  @apply border-2 border-theme-accent;
  @apply rounded-lg shadow-2xl;
  @apply w-full max-w-md;
  box-shadow: 0 0 40px rgba(0, 255, 247, 0.6);
  animation: tooltip-appear 0.3s ease-out;
}

@keyframes tooltip-appear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Position variations */
.position-center {
  @apply top-1/2 left-1/2;
  transform: translate(-50%, -50%);
}

.position-top {
  @apply top-4 left-1/2;
  transform: translateX(-50%);
}

.position-bottom {
  @apply bottom-4 left-1/2;
  transform: translateX(-50%);
}

.position-left {
  @apply top-1/2 left-4;
  transform: translateY(-50%);
}

.position-right {
  @apply top-1/2 right-4;
  transform: translateY(-50%);
}

/* Progress Bar */
.tooltip-progress {
  @apply h-1 bg-theme-primary;
  @apply overflow-hidden;
  @apply rounded-t-md;
}

.progress-bar {
  @apply h-full bg-theme-accent;
  @apply transition-all duration-300 ease-out;
}

/* Content */
.tooltip-content {
  @apply p-6 relative;
}

.close-btn {
  @apply absolute top-2 right-2;
  @apply w-8 h-8;
  @apply flex items-center justify-center;
  @apply text-theme-accent;
  @apply hover:text-theme-primary;
  @apply hover:bg-theme-accent;
  @apply transition-all duration-200;
  @apply cursor-pointer;
  @apply text-xl font-bold;
  @apply bg-transparent border-none;
  @apply rounded;
}

.tooltip-title {
  @apply text-xl font-bold text-theme-accent;
  @apply mb-3 pr-8;
}

.tooltip-description {
  @apply text-theme-primary;
  @apply mb-4 leading-relaxed;
}

/* Tips Section */
.tooltip-tips {
  @apply mb-4 p-3;
  @apply bg-theme-primary;
  @apply border-l-2 border-theme-accent;
  @apply rounded;
}

.tips-title {
  @apply text-sm font-semibold text-theme-accent;
  @apply mb-2;
}

.tips-list {
  @apply list-none space-y-1;
  @apply text-sm text-theme-secondary;
  @apply ml-0 pl-0;
}

.tips-list li {
  @apply relative pl-4;
}

.tips-list li::before {
  content: '▸';
  @apply absolute left-0;
  @apply text-theme-accent;
}

/* Footer */
.tooltip-footer {
  @apply flex items-center justify-between;
  @apply pt-4 border-t border-theme;
}

.step-counter {
  @apply text-sm text-theme-secondary;
  @apply font-mono;
}

.nav-buttons {
  @apply flex gap-2;
}

/* Buttons */
.btn-skip,
.btn-back,
.btn-next {
  @apply px-4 py-2;
  @apply rounded;
  @apply font-semibold;
  @apply transition-all duration-200;
  @apply cursor-pointer;
  @apply border-2;
}

.btn-skip {
  @apply bg-transparent;
  @apply border-theme-accent;
  @apply text-theme-accent;
  @apply hover:bg-theme-accent;
  @apply hover:text-theme-primary;
}

.btn-back {
  @apply bg-transparent;
  @apply border-theme-accent;
  @apply text-theme-accent;
  @apply hover:bg-theme-accent;
  @apply hover:text-theme-primary;
}

.btn-next {
  @apply bg-theme-accent;
  @apply border-theme-accent;
  @apply text-gray-900;
  @apply hover:bg-transparent;
  @apply hover:text-theme-accent;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .tour-tooltip {
    @apply max-w-[calc(100%-2rem)];
    @apply mx-4;
  }

  .position-center,
  .position-top,
  .position-bottom {
    @apply left-4 right-4;
    transform: none;
  }

  .position-center {
    @apply top-1/2;
    transform: translateY(-50%);
  }

  .position-left,
  .position-right {
    @apply left-4 right-4 top-auto bottom-4;
    transform: none;
  }

  .tooltip-content {
    @apply p-4;
  }

  .tooltip-title {
    @apply text-lg;
  }

  .tooltip-description {
    @apply text-sm;
  }

  .nav-buttons {
    @apply flex-wrap;
  }

  .btn-skip,
  .btn-back,
  .btn-next {
    @apply px-3 py-1.5 text-sm;
  }
}
</style>
