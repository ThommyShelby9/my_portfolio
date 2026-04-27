<script setup lang="ts">
defineProps<{
  kicker: string
  title: string
  excerpt: string
}>()
</script>

<template>
  <header class="cs-hero">
    <p class="cs-hero__kicker">{{ kicker }}</p>
    <h1 class="cs-hero__title">{{ title }}</h1>
    <p class="cs-hero__excerpt">{{ excerpt }}</p>
    <hr class="cs-hero__rule">
  </header>
</template>

<style scoped>
.cs-hero {
  padding: 4rem 0 3rem;
}

.cs-hero__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}

.cs-hero__title {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(2.5rem, 5vw + 1rem, 4rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  max-width: 22ch;
  margin: 1.5rem 0 0;
  color: var(--text);
}

.cs-hero__excerpt {
  font-family: theme('fontFamily.body');
  font-size: 1.25rem;
  line-height: 1.55;
  color: var(--text-mute);
  max-width: 38rem;
  margin: 1.25rem 0 0;
}

.cs-hero__rule {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 3rem 0 0;
  width: 8rem;
}
</style>
