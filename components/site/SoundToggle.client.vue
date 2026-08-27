<script setup lang="ts">
/**
 * Global opt-in ambient-sound control. Teleported to <body> (fixed-position
 * elements left inside <NuxtPage> break when the page-transition applies a
 * transform to it — same reason ManifestoHud teleports out). Sits bottom-left,
 * clear of the home-only ManifestoHud reel/skip row (bottom-left + bottom-right,
 * z-index 40) and below SiteHeader (z-index 50).
 */
const { enabled, supported, toggle } = useAmbientSound()
const { t } = useI18n()

const ariaLabel = computed(() => enabled.value ? t('sound.disable') : t('sound.enable'))
</script>

<template>
  <Teleport to="body">
    <button
      v-if="supported"
      type="button"
      class="sound-toggle"
      :class="{ 'sound-toggle--on': enabled }"
      :aria-pressed="enabled"
      :aria-label="ariaLabel"
      @click="toggle"
    >
      <span class="sound-toggle__icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" />
          <template v-if="enabled">
            <path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </template>
          <template v-else>
            <line x1="16" y1="9" x2="21" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <line x1="21" y1="9" x2="16" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </template>
        </svg>
      </span>

      <span class="sound-toggle__label">{{ t('sound.label') }}</span>

      <span v-if="enabled" class="sound-toggle__eq" aria-hidden="true">
        <span class="sound-toggle__bar" />
        <span class="sound-toggle__bar" />
        <span class="sound-toggle__bar" />
        <span class="sound-toggle__bar" />
      </span>
    </button>
  </Teleport>
</template>

<style scoped>
.sound-toggle {
  position: fixed;
  left: 20px;
  bottom: 64px; /* clears the home-only ManifestoHud row (bottom: 30px) with room to spare */
  z-index: 45; /* below SiteHeader (50), clear of ManifestoHud (40) */
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4375rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg-overlay);
  color: var(--text-soft);
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1;
  cursor: pointer;
  pointer-events: auto;
  transition: color 200ms ease, border-color 200ms ease;
}

.sound-toggle:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.sound-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.sound-toggle--on {
  color: var(--accent);
  border-color: var(--accent-soft);
}

.sound-toggle__icon {
  display: inline-flex;
  flex-shrink: 0;
}

.sound-toggle__eq {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 10px;
}

.sound-toggle__bar {
  width: 2px;
  height: 30%;
  background: currentColor;
  border-radius: 1px;
  animation: sound-toggle-eq 900ms ease-in-out infinite;
}
.sound-toggle__bar:nth-child(1) { animation-delay: 0ms; }
.sound-toggle__bar:nth-child(2) { animation-delay: 150ms; }
.sound-toggle__bar:nth-child(3) { animation-delay: 300ms; }
.sound-toggle__bar:nth-child(4) { animation-delay: 450ms; }

@keyframes sound-toggle-eq {
  0%, 100% { height: 30%; }
  50% { height: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .sound-toggle__bar {
    animation: none;
    height: 60%;
  }
}
</style>
