<script setup lang="ts">
const { t, locale } = useI18n()

const points = computed(() => locale.value === 'en'
  ? [
      { num: '01', title: 'Tight scoping before any code', body: 'I refuse open-ended engagements. Week one is making decisions visible: what is in, what is out, who arbitrates if it changes.' },
      { num: '02', title: 'Weekly delivery, no surprises', body: 'You see real progress every Friday. If something slipped, I tell you on Friday — not at the deadline.' },
      { num: '03', title: 'Documentation and handover', body: 'I leave behind something your team can run without me. No silent dependency on the freelancer.' },
    ]
  : [
      { num: '01', title: 'Cadrage rigoureux avant code', body: 'Je refuse les missions ouvertes. La première semaine sert à rendre les arbitrages visibles : ce qui est dedans, ce qui ne l\'est pas, qui décide si ça bouge.' },
      { num: '02', title: 'Livraisons hebdo, jamais de surprise', body: 'Tu vois un progrès réel chaque vendredi. Si quelque chose a glissé, je te le dis le vendredi — pas à la deadline.' },
      { num: '03', title: 'Documentation et passation soignées', body: 'Je laisse derrière moi ce que ton équipe peut faire tourner sans moi. Pas de dépendance silencieuse au freelance.' },
    ],
)
</script>

<template>
  <section class="approach" aria-labelledby="approach-heading">
    <div class="approach__inner">
      <FadeUp>
        <p class="approach__kicker">{{ t('approach.kicker') }}</p>
        <h2 id="approach-heading" class="sr-only">{{ t('approach.kicker') }}</h2>
      </FadeUp>

      <ol class="approach__list">
        <FadeUp v-for="point in points" :key="point.num" :delay="0.05" as="li">
          <article class="approach__item">
            <span class="approach__num">{{ point.num }}</span>
            <h3 class="approach__title">{{ point.title }}</h3>
            <p class="approach__body">{{ point.body }}</p>
          </article>
        </FadeUp>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.approach {
  padding: 8rem 1.5rem;
  border-top: 1px solid var(--border);
}

.approach__inner {
  max-width: theme('maxWidth.container');
  margin: 0 auto;
}

.approach__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0 0 3rem;
}

.approach__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
}

@media (max-width: 768px) {
  .approach__list {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.approach__item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.approach__num {
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  color: var(--accent);
  letter-spacing: 0.04em;
}

.approach__title {
  font-family: theme('fontFamily.display');
  font-size: 1.5rem;
  line-height: 1.2;
  font-weight: 400;
  margin: 0;
  color: var(--text);
}

.approach__body {
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  line-height: 1.65;
  color: var(--text-mute);
  margin: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
