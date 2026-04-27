<script setup lang="ts">
import { TOTAL_BRIEF_STEPS } from '~/types/brief'

const { t } = useI18n()
defineProps<{
  step: number
  canGoBack: boolean
  isLastStep: boolean
  submitting?: boolean
}>()
const emit = defineEmits<{ back: []; next: []; submit: [] }>()
</script>

<template>
  <div class="step-nav">
    <BriefStepIndicator :current="step" :total="TOTAL_BRIEF_STEPS" />

    <div class="step-nav__buttons">
      <button
        v-if="canGoBack"
        type="button"
        class="step-nav__back"
        :disabled="submitting"
        @click="emit('back')"
      >
        {{ t('brief.back') }}
      </button>
      <span v-else />

      <button
        v-if="!isLastStep"
        type="button"
        class="step-nav__next"
        @click="emit('next')"
      >
        {{ t('brief.next') }}
      </button>
      <button
        v-else
        type="button"
        class="step-nav__submit"
        :disabled="submitting"
        @click="emit('submit')"
      >
        {{ submitting ? '…' : t('brief.submit') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.step-nav {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 3rem;
}

.step-nav__buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-nav__back {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  background: transparent;
  color: var(--text-mute);
  border: 0;
  padding: 0.625rem 1rem;
  cursor: pointer;
}

.step-nav__back:hover { color: var(--text); }

.step-nav__next, .step-nav__submit {
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--text);
  color: var(--bg);
  border: 0;
  padding: 0.875rem 1.5rem;
  cursor: pointer;
  transition: opacity 150ms;
}

.step-nav__next:disabled, .step-nav__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
