<script setup lang="ts" generic="T extends string">
defineProps<{
  modelValue: T
  options: Array<{ value: T; label: string; hint?: string }>
  name: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: T] }>()

function pick(v: T) {
  emit('update:modelValue', v)
}
</script>

<template>
  <div class="brief-radio" role="radiogroup">
    <label
      v-for="opt in options"
      :key="opt.value"
      :class="['brief-radio__option', { 'brief-radio__option--active': modelValue === opt.value }]"
    >
      <input
        type="radio"
        :name="name"
        :value="opt.value"
        :checked="modelValue === opt.value"
        class="brief-radio__input"
        @change="pick(opt.value)"
      >
      <span class="brief-radio__indicator" aria-hidden="true">
        <span class="brief-radio__dot" />
      </span>
      <span class="brief-radio__body">
        <span class="brief-radio__label">{{ opt.label }}</span>
        <span v-if="opt.hint" class="brief-radio__hint">{{ opt.hint }}</span>
      </span>
    </label>
  </div>
</template>

<style scoped>
.brief-radio {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.brief-radio__option {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color 150ms, background 150ms;
  border-radius: 4px;
}

.brief-radio__option:hover {
  border-color: var(--border-strong);
}

.brief-radio__option--active {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.brief-radio__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.brief-radio__indicator {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.125rem;
  background: var(--bg);
}

.brief-radio__option--active .brief-radio__indicator {
  border-color: var(--accent);
}

.brief-radio__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
}

.brief-radio__option--active .brief-radio__dot {
  background: var(--accent);
}

.brief-radio__body {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  font-family: theme('fontFamily.body');
}

.brief-radio__label {
  color: var(--text);
  font-size: 0.9375rem;
  line-height: 1.4;
}

.brief-radio__hint {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  color: var(--text-soft);
  letter-spacing: 0.02em;
}
</style>
