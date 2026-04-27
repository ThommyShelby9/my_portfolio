<script setup lang="ts">
import { TOTAL_BRIEF_STEPS } from '~/types/brief'

const { step, submitting, submitError, next, back, submit } = useBriefForm()
</script>

<template>
  <form class="brief-form" @submit.prevent="submit">
    <transition name="step" mode="out-in">
      <BriefStep1Project v-if="step === 1" key="step-1" />
      <BriefStep2Context v-else-if="step === 2" key="step-2" />
      <BriefStep3Frame v-else-if="step === 3" key="step-3" />
      <BriefStep4Identity v-else key="step-4" />
    </transition>

    <p v-if="submitError" class="brief-form__error" role="alert">
      {{ submitError }}
    </p>

    <BriefStepNav
      :step="step"
      :can-go-back="step > 1"
      :is-last-step="step === TOTAL_BRIEF_STEPS"
      :submitting="submitting"
      @back="back"
      @next="next"
      @submit="submit"
    />
  </form>
</template>

<style scoped>
.brief-form {
  display: flex;
  flex-direction: column;
}

.brief-form__error {
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
  color: var(--error);
  background: color-mix(in oklab, var(--error) 12%, transparent);
  border: 1px solid color-mix(in oklab, var(--error) 30%, transparent);
  padding: 0.875rem 1rem;
  border-radius: 4px;
  margin: 1.5rem 0 0;
  letter-spacing: 0.02em;
}

.step-enter-active, .step-leave-active {
  transition: opacity 200ms, transform 200ms;
}
.step-enter-from { opacity: 0; transform: translateX(8px); }
.step-leave-to { opacity: 0; transform: translateX(-8px); }
</style>
