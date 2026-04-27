<script setup lang="ts">
defineProps<{
  results: Array<{ value: string; label: string }>
}>()
</script>

<template>
  <section class="cs-results" aria-label="Key results">
    <div v-for="r in results" :key="r.label" class="cs-results__item">
      <p class="cs-results__value">{{ r.value }}</p>
      <p class="cs-results__label">{{ r.label }}</p>
    </div>
  </section>
</template>

<style scoped>
.cs-results {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 4rem 0;
  padding: 3rem 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

@media (max-width: 600px) {
  .cs-results {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.cs-results__item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cs-results__value {
  font-family: theme('fontFamily.display');
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 400;
  line-height: 1;
  color: var(--accent);
  margin: 0;
}

.cs-results__label {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: uppercase;
  margin: 0;
}
</style>
