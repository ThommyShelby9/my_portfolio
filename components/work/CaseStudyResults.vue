<script setup lang="ts">
defineProps<{
  results: Array<{ value: string; label: string }>
}>()
</script>

<template>
  <section class="cs-results" aria-label="Key results">
    <header class="cs-results__head">
      <span class="mono-tag">— RESULTS</span>
    </header>
    <div class="cs-results__grid">
      <RevealOnView
        v-for="(r, i) in results"
        :key="r.label"
        :delay="i * 0.08"
        class="cs-results__item"
      >
        <p class="cs-results__value">{{ r.value }}</p>
        <p class="cs-results__label">{{ r.label }}</p>
      </RevealOnView>
    </div>
  </section>
</template>

<style scoped>
.cs-results {
  margin: 4rem 0;
  padding: 3rem 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.cs-results__head {
  margin-bottom: 1.5rem;
}

.cs-results__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

@media (max-width: 600px) {
  .cs-results__grid {
    grid-template-columns: 1fr;
    gap: 1.75rem;
  }
}

.cs-results__item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cs-results__value {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.25rem, 4.5vw, 3.75rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1;
  color: var(--accent);
  margin: 0;
}

.cs-results__label {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  color: var(--text-soft);
  text-transform: uppercase;
  margin: 0;
}
</style>
