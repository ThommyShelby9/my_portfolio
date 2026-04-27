<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  label: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <label :class="['brief-checkbox', { 'brief-checkbox--active': modelValue }]">
    <input
      type="checkbox"
      :checked="modelValue"
      class="brief-checkbox__input"
      @change="emit('update:modelValue', !modelValue)"
    >
    <span class="brief-checkbox__box" aria-hidden="true">
      <svg v-if="modelValue" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" stroke-width="2" />
      </svg>
    </span>
    <span class="brief-checkbox__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.brief-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0;
  cursor: pointer;
  font-family: theme('fontFamily.body');
  color: var(--text-mute);
}

.brief-checkbox:hover {
  color: var(--text);
}

.brief-checkbox--active {
  color: var(--text);
}

.brief-checkbox__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.brief-checkbox__box {
  width: 18px;
  height: 18px;
  border: 1px solid var(--border-strong);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--bg);
  background: var(--bg);
  border-radius: 3px;
  transition: background 150ms, border-color 150ms;
}

.brief-checkbox--active .brief-checkbox__box {
  background: var(--accent);
  border-color: var(--accent);
}

.brief-checkbox__label {
  font-size: 0.9375rem;
}
</style>
