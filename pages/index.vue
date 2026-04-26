<script setup lang="ts">
useSeoMeta({
  title: 'Rostel Panoumassi — Lead Engineering',
  description: 'Je conçois et livre des produits logiciels fiables pour des équipes qui n\'ont pas le droit à l\'erreur.',
})
</script>

<template>
  <section class="hero">
    <div class="hero__inner">
      <p class="hero__kicker">v3.0 · cotonou, BJ</p>
      <h1 class="hero__title">
        Je conçois et livre des produits
        <em>logiciels fiables</em>
        pour des équipes qui n'ont pas le droit à l'erreur.
      </h1>
      <p class="hero__sub">
        Lead Engineering chez KPS Groupe. Disponible pour deux missions
        sélectionnées par trimestre — fintech, data, plateformes B2B.
      </p>
      <div class="hero__actions">
        <NuxtLink to="/brief" class="hero__cta-primary">Démarrer un projet →</NuxtLink>
        <NuxtLink to="/about" class="hero__cta-secondary">Lire mon approche</NuxtLink>
      </div>
      <p class="hero__meta">
        03 case studies — 5 années — 12 produits livrés
      </p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 8rem 1.5rem 6rem;
}

.hero__inner {
  max-width: theme('maxWidth.container');
  margin: 0 auto;
}

.hero__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}

.hero__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.5rem, 5vw + 1rem, 4.5rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-weight: 400;
  max-width: 18ch;
  margin: 2.5rem 0 0;
  color: var(--text);
}

.hero__title em {
  font-style: italic;
  color: var(--text-mute);
}

.hero__sub {
  font-family: theme('fontFamily.body');
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-mute);
  max-width: 36rem;
  margin: 1.5rem 0 0;
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.hero__cta-primary {
  background: var(--text);
  color: var(--bg);
  padding: 0.875rem 1.5rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  transition: opacity 150ms;
}

.hero__cta-primary:hover {
  opacity: 0.9;
}

.hero__cta-secondary {
  font-family: theme('fontFamily.body');
  font-size: 0.9375rem;
  color: var(--text);
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 2px;
  text-decoration: none;
}

.hero__meta {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  margin: 6rem 0 0;
}
</style>
