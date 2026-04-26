<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="achievement in activeToasts"
          :key="achievement.id"
          class="achievement-toast"
          @click="dismissToast(achievement.id)"
          role="alert"
          aria-live="polite"
        >
          <!-- Achievement Icon -->
          <div class="toast-icon">{{ achievement.icon }}</div>

          <!-- Achievement Content -->
          <div class="toast-content">
            <div class="toast-badge">Achievement Unlocked!</div>
            <div class="toast-title">{{ achievement.title }}</div>
            <div class="toast-description">{{ achievement.description }}</div>
          </div>

          <!-- Close Button -->
          <button class="toast-close" @click.stop="dismissToast(achievement.id)" aria-label="Dismiss">
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAchievementsStore } from '@/stores/achievements'

const store = useAchievementsStore()
const { activeToasts } = storeToRefs(store)

function dismissToast(achievementId: string) {
  store.dismissToast(achievementId)
}
</script>

<style scoped>
/* Toast Container */
.toast-container {
  @apply fixed top-4 right-4 z-[9999];
  @apply flex flex-col gap-2;
  @apply pointer-events-none;
}

/* Mobile: center at top */
@media (max-width: 768px) {
  .toast-container {
    @apply top-4 left-4 right-4;
    @apply items-center;
  }
}

/* Achievement Toast */
.achievement-toast {
  @apply pointer-events-auto;
  @apply relative flex items-start gap-3;
  @apply w-80 max-w-full;
  @apply bg-theme-secondary;
  @apply border-2 border-theme-accent;
  @apply rounded-lg p-4;
  @apply cursor-pointer;
  box-shadow: 0 0 30px rgba(0, 255, 247, 0.5);
  backdrop-filter: blur(10px);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 255, 247, 0.4);
  }
  50% {
    box-shadow: 0 0 40px rgba(0, 255, 247, 0.7);
  }
}

.achievement-toast:hover {
  @apply border-theme-accent;
  box-shadow: 0 0 40px rgba(0, 255, 247, 0.8);
}

/* Mobile: smaller width */
@media (max-width: 768px) {
  .achievement-toast {
    @apply w-full max-w-sm;
  }
}

/* Toast Icon */
.toast-icon {
  @apply text-4xl flex-shrink-0;
  @apply w-12 h-12 flex items-center justify-center;
  @apply bg-theme-accent-dark rounded-full;
  animation: bounce-in 0.5s ease-out;
}

@keyframes bounce-in {
  0% {
    transform: scale(0) rotate(-180deg);
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* Toast Content */
.toast-content {
  @apply flex-1 min-w-0;
}

.toast-badge {
  @apply text-xs font-bold uppercase tracking-wider;
  @apply text-theme-accent mb-1;
  animation: slide-down 0.3s ease-out;
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast-title {
  @apply text-base font-bold text-theme-accent mb-1;
  animation: slide-in 0.4s ease-out 0.1s both;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-description {
  @apply text-sm text-theme-primary;
  animation: fade-in 0.5s ease-out 0.2s both;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Close Button */
.toast-close {
  @apply flex-shrink-0;
  @apply w-6 h-6 flex items-center justify-center;
  @apply text-theme-secondary hover:text-theme-accent;
  @apply rounded transition-colors duration-200;
  @apply -mt-1 -mr-1;
}

.toast-close:hover {
  @apply bg-theme-accent-dark;
}

/* Transition Group Animations */
.toast-enter-active {
  animation: toast-enter 0.4s ease-out;
}

.toast-leave-active {
  animation: toast-leave 0.3s ease-in;
}

@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toast-leave {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
}

/* Mobile: slide from top */
@media (max-width: 768px) {
  @keyframes toast-enter {
    from {
      opacity: 0;
      transform: translateY(-100%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes toast-leave {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(-100%) scale(0.9);
    }
  }
}
</style>
