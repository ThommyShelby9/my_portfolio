<script setup lang="ts">
// Always-on engineering status panel — small terminal-like card in the hero
// with a few rotating "telemetry" lines. Decorative but accurate.
const { locale } = useI18n()

const lines = computed(() => locale.value === 'en'
  ? [
      { k: 'status', v: 'available q3 2026', dot: 'available' },
      { k: 'role', v: 'head of engineering · kps groupe' },
      { k: 'shipped', v: '10+ products · 5 years' },
      { k: 'stack', v: 'django · spring · vue · k8s · flutter' },
      { k: 'last_commit', v: 'feat(home): editorial rebrand' },
      { k: 'now', v: 'reading: A Philosophy of Software Design' },
    ]
  : [
      { k: 'status', v: 'dispo q3 2026', dot: 'available' },
      { k: 'rôle', v: 'lead engineering · kps groupe' },
      { k: 'livrés', v: '10+ produits · 5 ans' },
      { k: 'stack', v: 'django · spring · vue · k8s · flutter' },
      { k: 'dernier_commit', v: 'feat(home): refonte éditoriale' },
      { k: 'maintenant', v: 'lit: A Philosophy of Software Design' },
  ],
)

const current = ref(0)
const interval = ref<number | null>(null)

onMounted(() => {
  interval.value = window.setInterval(() => {
    current.value = (current.value + 1) % lines.value.length
  }, 3500)
})
onBeforeUnmount(() => {
  if (interval.value) clearInterval(interval.value)
})
</script>

<template>
  <aside class="hero-status" aria-label="Engineering log">
    <header class="hero-status__head">
      <span class="hero-status__dot" />
      <span class="hero-status__title">SYSTEM LOG</span>
      <span class="hero-status__time">live</span>
    </header>
    <ol class="hero-status__list">
      <li v-for="(line, i) in lines" :key="line.k" :class="{ 'is-current': i === current }">
        <span class="hero-status__key">{{ line.k }}</span>
        <span class="hero-status__val">
          <span v-if="line.dot === 'available'" class="hero-status__chip" />
          {{ line.v }}
        </span>
      </li>
    </ol>
  </aside>
</template>

<style scoped>
.hero-status {
  background: var(--bg-overlay);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1.1rem 1.25rem 1.25rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: var(--text-mute);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 1px 0 var(--paper-tint) inset,
    0 20px 40px -28px rgba(0, 0, 0, 0.4);
}

.hero-status::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.6;
}

.hero-status__head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-bottom: 0.9rem;
  border-bottom: 1px dashed var(--border);
  margin-bottom: 0.9rem;
}
.hero-status__dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  animation: head-pulse 1.6s ease-in-out infinite;
}
@keyframes head-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.hero-status__title {
  font-size: 0.6875rem;
  letter-spacing: 0.18em;
  color: var(--text);
  text-transform: uppercase;
  flex: 1;
}
.hero-status__time {
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  color: var(--text-soft);
  text-transform: uppercase;
}

.hero-status__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.hero-status__list li {
  display: grid;
  grid-template-columns: minmax(80px, 28%) 1fr;
  gap: 0.7rem;
  align-items: baseline;
  opacity: 0.55;
  transition: opacity 350ms ease, color 350ms ease;
}
.hero-status__list li.is-current {
  opacity: 1;
}
.hero-status__list li.is-current .hero-status__val {
  color: var(--text);
}
.hero-status__list li::before {
  display: none;
}
.hero-status__key {
  color: var(--text-soft);
  text-transform: uppercase;
  font-size: 0.625rem;
  letter-spacing: 0.12em;
}
.hero-status__val {
  color: var(--text-mute);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.hero-status__chip {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--available);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--available) 25%, transparent);
}
</style>
