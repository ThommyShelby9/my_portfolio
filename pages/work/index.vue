<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const studies = await useAllWork()

useSeoMeta({
  title: () => `${t('work_index.title')} — ${t('site.name')}`,
  description: () => t('work_index.sub'),
})

const sectors = computed(() => {
  const set = new Set<string>()
  ;(studies.value ?? []).forEach((s: any) => set.add(s.sector))
  return ['all', ...Array.from(set).sort()]
})

const activeSector = ref<string>('all')

const filtered = computed(() => {
  if (activeSector.value === 'all') return studies.value ?? []
  return (studies.value ?? []).filter((s: any) => s.sector === activeSector.value)
})

const heroProps = computed(() => locale.value === 'en'
  ? { num: '02', kicker: 'Selected case studies — picked for impact', title: 'The', emphasis: 'work.' }
  : { num: '02', kicker: 'Études de cas — choisies pour leur impact', title: 'Les', emphasis: 'travaux.' },
)
</script>

<template>
  <div class="work-index">
    <PageHero v-bind="heroProps" :sub="t('work_index.sub')" />

    <div class="container-narrow work-index__bar">
      <span class="mono-tag">{{ t('work_index.filter_label') }} —</span>
      <div class="chips">
        <button
          v-for="sector in sectors"
          :key="sector"
          type="button"
          :class="['chip', { 'chip--active': activeSector === sector }]"
          @click="activeSector = sector"
        >
          {{ sector === 'all' ? t('work_index.filter_all') : sector }}
        </button>
      </div>
    </div>

    <div class="container-narrow work-list">
      <RevealOnView
        v-for="(study, i) in filtered"
        :key="(study as any).slug"
        as="article"
        :delay="i * 0.06"
      >
        <NuxtLink
          :to="localePath(`/work/${(study as any).slug}`)"
          class="entry"
          data-cursor="text"
          :data-cursor-label="locale === 'en' ? 'read' : 'lire'"
        >
          <div class="entry__num">
            <span>N°</span>
            <em>{{ String(i + 1).padStart(2, '0') }}</em>
          </div>
          <div class="entry__body">
            <p class="entry__kicker">{{ (study as any).kicker }}</p>
            <h2 class="entry__title">{{ (study as any).title }}</h2>
            <p class="entry__excerpt">{{ (study as any).excerpt }}</p>
            <div class="entry__bottom">
              <span class="entry__stack">{{ ((study as any).stack ?? []).slice(0, 4).join(' / ') }}</span>
              <span v-if="(study as any).results?.[0]" class="entry__result">
                <em>{{ (study as any).results[0].value }}</em>
                <span>— {{ (study as any).results[0].label }}</span>
              </span>
            </div>
          </div>
          <span class="entry__arrow" aria-hidden="true">↗</span>
        </NuxtLink>
      </RevealOnView>

      <p v-if="filtered.length === 0" class="work-list__empty">
        {{ locale === 'en' ? 'No case studies match this filter.' : 'Aucune étude ne correspond à ce filtre.' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.work-index {
  padding-bottom: 6rem;
}

.work-index__bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem 1.5rem 1.5rem;
  flex-wrap: wrap;
}

.chips {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.chip {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: transparent;
  color: var(--text-mute);
  border: 1px solid var(--border);
  padding: 0.5rem 0.95rem;
  border-radius: 999px;
  cursor: pointer;
  transition: color 200ms, border-color 200ms, background 200ms;
}
.chip:hover {
  color: var(--text);
  border-color: var(--border-strong);
}
.chip--active {
  color: var(--accent-ink);
  background: var(--accent);
  border-color: var(--accent);
}

.work-list {
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border);
}

.entry {
  display: grid;
  grid-template-columns: 100px 1fr 32px;
  gap: 2.5rem;
  align-items: start;
  padding: 3rem 0;
  border-bottom: 1px solid var(--border);
  text-decoration: none;
  color: inherit;
  position: relative;
  transition: background 250ms;
}
.entry:hover {
  background: var(--bg-raised);
  padding-left: 1rem;
  padding-right: 1rem;
}
.entry::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-left: 2px solid transparent;
  transition: border-color 200ms;
}
.entry:hover::after { border-left-color: var(--accent); }

@media (max-width: 720px) {
  .entry {
    grid-template-columns: 60px 1fr;
    gap: 1.25rem;
  }
  .entry__arrow { display: none; }
}

.entry__num {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.entry__num span {
  font-family: theme('fontFamily.mono');
  font-size: 0.625rem;
  letter-spacing: 0.18em;
  color: var(--text-soft);
}
.entry__num em {
  font-family: theme('fontFamily.editorial');
  font-style: italic;
  font-size: clamp(2.5rem, 5vw, 4rem);
  color: var(--accent);
  line-height: 0.9;
}

.entry__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}
.entry__title {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--text);
  margin: 0.75rem 0 0;
  transition: color 250ms;
  max-width: 26ch;
}
.entry:hover .entry__title { color: var(--accent); }
.entry__excerpt {
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  line-height: 1.55;
  color: var(--text-mute);
  margin: 0.75rem 0 0;
  max-width: 56ch;
}
.entry__bottom {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 2rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}
.entry__stack {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-mute);
}
.entry__result {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-soft);
}
.entry__result em {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-style: normal;
  font-size: 1.25rem;
  color: var(--text);
  letter-spacing: -0.015em;
}

.entry__arrow {
  font-family: theme('fontFamily.mono');
  font-size: 1.25rem;
  color: var(--text-soft);
  align-self: center;
  transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1), color 250ms;
}
.entry:hover .entry__arrow {
  transform: translate(4px, -4px);
  color: var(--accent);
}

.work-list__empty {
  padding: 4rem 0;
  text-align: center;
  font-family: theme('fontFamily.body');
  color: var(--text-soft);
}
</style>
