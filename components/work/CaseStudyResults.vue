<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  results: Array<{ value: string; label: string }>
}>()
</script>

<template>
  <section class="cs-results" aria-label="Key results">
    <header class="cs-results__head">
      <p class="cs-results__kicker">{{ t('case_study.results') }}</p>
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
/* Data band — a distinct cinematic beat between the meta strip and the
   long-form body: full top/bottom rules, generous air, numbers doing the
   talking. */
.cs-results {
  margin: 4.5rem 0;
  padding: 4rem 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.cs-results__head {
  margin-bottom: 2.5rem;
}

.cs-results__kicker {
  font-family: theme('fontFamily.mono');
  font-style: normal;
  font-weight: 500;
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0;
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
  gap: 0.6rem;
}

.cs-results__value {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1;
  color: var(--accent);
  margin: 0;
}

.cs-results__label {
  font-family: theme('fontFamily.mono');
  font-style: normal;
  font-weight: 400;
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  color: var(--text-soft);
  text-transform: uppercase;
  margin: 0;
}
</style>
