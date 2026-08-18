<script setup lang="ts">
defineProps<{ index: number; kicker: string; title: string }>()
</script>

<template>
  <section class="scene">
    <div class="scene__eat" data-eat>
      <p class="scene__kicker">{{ kicker }}</p>
      <h2 class="scene__title">{{ title }}</h2>
    </div>
  </section>
</template>

<style scoped>
.scene { min-height: 100vh; display: grid; place-items: center; padding: 12vh 6vw; text-align: center; }
.scene__eat { will-change: transform, opacity, filter; transform-origin: center center; max-width: 22ch; }
.scene__kicker {
  font-family: theme('fontFamily.mono'); font-size: 0.72rem; letter-spacing: 0.24em;
  text-transform: uppercase; color: var(--accent); margin: 0 0 1.1rem;
}
.scene__title {
  font-family: theme('fontFamily.editorial'); font-weight: 400;
  font-size: clamp(1.9rem, 5.2vw, 3.6rem); line-height: 1.08; letter-spacing: -0.01em;
  color: var(--text); margin: 0; text-wrap: balance; text-shadow: 0 2px 40px rgba(0,0,0,.7);
}
</style>
