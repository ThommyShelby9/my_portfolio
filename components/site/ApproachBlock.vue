<script setup lang="ts">
const { t, locale } = useI18n()

const points = computed(() => locale.value === 'en'
  ? [
      { num: '01', title: 'Tight scoping before any code', body: 'I refuse open-ended engagements. Week one is making decisions visible: what is in, what is out, who arbitrates if it changes.', tag: 'SCOPE' },
      { num: '02', title: 'Weekly delivery, no surprises', body: 'You see real progress every Friday. If something slipped, I tell you on Friday — not at the deadline.', tag: 'CADENCE' },
      { num: '03', title: 'Documentation and handover', body: 'I leave behind something your team can run without me. No silent dependency on the freelancer.', tag: 'HANDOFF' },
    ]
  : [
      { num: '01', title: 'Cadrage rigoureux avant code', body: 'Je refuse les missions ouvertes. La première semaine sert à rendre les arbitrages visibles : ce qui est dedans, ce qui ne l\'est pas, qui décide si ça bouge.', tag: 'CADRAGE' },
      { num: '02', title: 'Livraisons hebdo, jamais de surprise', body: 'Tu vois un progrès réel chaque vendredi. Si quelque chose a glissé, je te le dis le vendredi — pas à la deadline.', tag: 'CADENCE' },
      { num: '03', title: 'Documentation et passation soignées', body: 'Je laisse derrière moi ce que ton équipe peut faire tourner sans moi. Pas de dépendance silencieuse au freelance.', tag: 'PASSATION' },
    ],
)
</script>

<template>
  <section class="approach" aria-labelledby="approach-heading">
    <div class="approach__inner container-narrow">
      <RevealOnView class="approach__head">
        <p class="mono-tag">/ 03 — {{ t('approach.kicker') }}</p>
        <h2 id="approach-heading" class="approach__title">
          {{ locale === 'en' ? 'A method' : 'Une méthode' }}
          <em class="editorial">— {{ locale === 'en' ? 'kept simple on purpose' : 'volontairement simple' }}</em>
        </h2>
      </RevealOnView>

      <div class="schematic">
        <div class="schematic__rail" aria-hidden="true">
          <span class="schematic__rail-line" />
          <span class="schematic__rail-tick" />
          <span class="schematic__rail-tick" />
          <span class="schematic__rail-tick" />
        </div>

        <ol class="schematic__list">
          <RevealOnView v-for="(p, i) in points" :key="p.num" as="li" :delay="i * 0.1" class="schematic__item">
            <div class="schematic__marker">
              <span class="schematic__num">{{ p.num }}</span>
              <span class="schematic__tag">{{ p.tag }}</span>
            </div>
            <article class="schematic__card">
              <h3 class="schematic__title">{{ p.title }}</h3>
              <p class="schematic__body">{{ p.body }}</p>
            </article>
          </RevealOnView>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.approach {
  padding: 8rem 0;
  border-top: 1px solid var(--border);
  position: relative;
}

.approach__head {
  margin-bottom: 5rem;
}
.approach__title {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(2.25rem, 4.5vw, 4rem);
  line-height: 1.0;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0.75rem 0 0;
}
.approach__title em {
  display: block;
  font-family: theme('fontFamily.editorial');
  color: var(--text-mute);
  font-size: 0.65em;
  margin-top: 0.15em;
}

/* Schematic */
.schematic {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 2rem;
}
@media (max-width: 720px) {
  .schematic {
    grid-template-columns: 60px 1fr;
    gap: 1rem;
  }
}

.schematic__rail {
  position: relative;
  height: 100%;
}
.schematic__rail-line {
  position: absolute;
  left: 50%;
  top: 16px;
  bottom: 16px;
  width: 1px;
  background: linear-gradient(to bottom, transparent, var(--border-strong) 20%, var(--border-strong) 80%, transparent);
  transform: translateX(-0.5px);
}
.schematic__rail-tick {
  display: none;
}

.schematic__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.schematic__item {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  position: relative;
}
.schematic__item::before {
  content: '';
  position: absolute;
  left: calc(-2rem - 40px);
  top: 14px;
  width: 12px;
  height: 12px;
  background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 0 4px var(--bg), 0 0 0 5px var(--accent);
  z-index: 1;
}
@media (max-width: 720px) {
  .schematic__item::before {
    left: calc(-1rem - 30px);
  }
}

.schematic__marker {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}
.schematic__num {
  font-family: theme('fontFamily.editorial');
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  line-height: 0.9;
  color: var(--text);
}
.schematic__tag {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  color: var(--accent);
}

.schematic__card {
  max-width: 60ch;
}
.schematic__title {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(1.375rem, 2.5vw, 1.75rem);
  line-height: 1.2;
  color: var(--text);
  margin: 0 0 0.75rem;
}
.schematic__body {
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  line-height: 1.65;
  color: var(--text-mute);
  margin: 0;
}
</style>
