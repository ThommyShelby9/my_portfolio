<script setup lang="ts">
const { mode, cycle } = useTheme()

const labels = {
  auto: 'Auto',
  light: 'Clair',
  dark: 'Sombre',
} as const

const ariaLabel = computed(() => `Thème : ${labels[mode.value]} — cliquer pour changer`)
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="ariaLabel"
    @click="cycle"
  >
    <span class="theme-toggle__icon" aria-hidden="true">
      <svg v-if="mode === 'dark'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg v-else-if="mode === 'light'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18" />
      </svg>
    </span>
    <span class="theme-toggle__label">{{ labels[mode] }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-mute);
  background: transparent;
  transition: color 150ms, border-color 150ms;
}

.theme-toggle:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.theme-toggle__icon {
  display: inline-flex;
  color: var(--text-soft);
}

.theme-toggle:hover .theme-toggle__icon {
  color: var(--accent);
}
</style>
