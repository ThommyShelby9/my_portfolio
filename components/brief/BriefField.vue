<script setup lang="ts">
const props = defineProps<{
  label: string
  hint?: string
  error?: string
  required?: boolean
  for?: string
}>()
</script>

<template>
  <div :class="['field', { 'field--error': error }]">
    <label v-if="label" :for="props.for" class="field__label">
      {{ label }}<span v-if="required" class="field__required" aria-hidden="true"> *</span>
    </label>
    <p v-if="hint" class="field__hint">{{ hint }}</p>
    <slot />
    <p v-if="error" class="field__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 2rem;
}

.field__label {
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  color: var(--text);
  font-weight: 500;
}

.field__required {
  color: var(--accent);
}

.field__hint {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-soft);
  margin: 0;
  letter-spacing: 0.02em;
}

.field__error {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--error);
  margin: 0;
}

.field--error :deep(input),
.field--error :deep(textarea),
.field--error :deep(.brief-radio__option) {
  border-color: var(--error);
}
</style>
