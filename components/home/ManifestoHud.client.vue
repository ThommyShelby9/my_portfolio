<script setup lang="ts">
/**
 * Filmic bottom HUD for the manifesto home: a mono "reel" timecode (decorative)
 * on the left, a real skip-to-work link on the right. Teleported to <body> —
 * app.vue's page transition applies a `transform` to <NuxtPage>, which would
 * break the containing block of a `position: fixed` element left inside it
 * (same reason SiteHeader's mobile curtain teleports out).
 */
const props = defineProps<{ progress: number }>()
const { t } = useI18n()
const localePath = useLocalePath()

// Fake reel timecode over a 4-minute reel, derived from scroll progress (0..1).
const reel = computed(() => {
  const p = Math.min(1, Math.max(0, props.progress))
  const mm = Math.floor(p * 4)
  const ss = Math.floor(((p * 4) % 1) * 60)
  return `REEL · 0${mm}:${ss.toString().padStart(2, '0')}`
})
</script>

<template>
  <Teleport to="body">
    <div class="manifesto-hud">
      <p class="manifesto-hud__reel" aria-hidden="true">{{ reel }}</p>
      <NuxtLink :to="localePath('/work')" class="manifesto-hud__skip">
        <span>{{ t('manifesto.hud_skip') }}</span>
        <span class="manifesto-hud__glyph" aria-hidden="true">▸</span>
      </NuxtLink>
    </div>
  </Teleport>
</template>

<style scoped>
.manifesto-hud {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 30px; /* clears the 26px bottom film-bar + a hair of breathing room */
  z-index: 40; /* below the header (50), above the film letterbox */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 clamp(1.25rem, 4vw, 2.5rem);
  pointer-events: none;
  animation: hud-in 0.9s cubic-bezier(.2, .7, .2, 1) 2s both;
}

.manifesto-hud__reel {
  margin: 0;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-soft);
  text-shadow: 0 1px 12px rgba(0, 0, 0, .8);
  transition: color 1.2s ease;
}

.manifesto-hud__skip {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-mute);
  text-decoration: none;
  border-radius: 2px;
  transition: color 200ms ease;
}
.manifesto-hud__skip:hover,
.manifesto-hud__skip:focus-visible {
  color: var(--accent);
}
.manifesto-hud__skip:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.manifesto-hud__glyph {
  display: inline-block;
  transition: transform 200ms ease;
}
.manifesto-hud__skip:hover .manifesto-hud__glyph,
.manifesto-hud__skip:focus-visible .manifesto-hud__glyph {
  transform: translateX(3px);
}

@keyframes hud-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .manifesto-hud { animation: none; }
  .manifesto-hud__reel { transition: none; }
  .manifesto-hud__skip,
  .manifesto-hud__glyph { transition: none; }
}
</style>
