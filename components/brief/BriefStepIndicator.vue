<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  current: number
  total: number
}>()
</script>

<template>
  <div class="step-indicator">
    <span class="step-indicator__label">
      {{ t('brief.step_label', { current, total }) }}
    </span>
    <div class="step-indicator__bar">
      <span
        class="step-indicator__fill"
        :style="{ width: `${(current / total) * 100}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
.step-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: uppercase;
}

.step-indicator__bar {
  flex: 1;
  height: 2px;
  background: var(--border);
  border-radius: 999px;
  overflow: hidden;
}

.step-indicator__fill {
  display: block;
  height: 100%;
  background: var(--accent);
  transition: width 300ms ease-out;
}
</style>
