<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const studies = await useFeaturedWork(3)
</script>

<template>
  <section class="featured" aria-labelledby="featured-heading">
    <div class="featured__inner container-narrow">
      <RevealOnView class="featured__head">
        <p class="mono-tag">/ 02 — {{ t('featured.kicker') }}</p>
        <h2 id="featured-heading" class="featured__title">
          {{ locale === 'en' ? 'Selected' : 'Sélection' }}
          <em class="editorial">— {{ locale === 'en' ? 'recent shipments' : 'récentes livraisons' }}</em>
        </h2>
      </RevealOnView>

      <ol class="featured__list">
        <li
          v-for="(study, i) in studies ?? []"
          :key="study.slug"
          class="entry"
          :class="{ 'entry--flip': i % 2 === 1 }"
        >
          <NuxtLink :to="localePath(`/work/${study.slug}`)" class="entry__link" data-cursor="text" :data-cursor-label="locale === 'en' ? 'read' : 'lire'">
            <div class="entry__num">
              <span class="entry__num-pre">N°</span>
              <span class="entry__num-val">{{ String(i + 1).padStart(2, '0') }}</span>
            </div>

            <div class="entry__body">
              <p class="entry__kicker">{{ study.kicker }}</p>
              <h3 class="entry__title">{{ study.title }}</h3>
              <p class="entry__excerpt">{{ study.excerpt }}</p>

              <div class="entry__bottom">
                <div v-if="study.results?.[0]" class="entry__result">
                  <span class="entry__result-val">{{ study.results[0].value }}</span>
                  <span class="entry__result-lbl">{{ study.results[0].label }}</span>
                </div>
                <p class="entry__stack">{{ (study.stack ?? []).slice(0, 4).join(' / ') }}</p>
                <span class="entry__cta">
                  <span>{{ t('case_study.read') }}</span>
                  <span class="entry__cta-arrow">↗</span>
                </span>
              </div>
            </div>

            <div class="entry__preview" aria-hidden="true">
              <div v-if="(study as any).cover" class="entry__preview-img-wrap">
                <img :src="(study as any).cover" :alt="study.title" loading="lazy" class="entry__preview-img">
              </div>
              <div v-else class="entry__decor">
                <span class="entry__decor-line" />
                <span class="entry__decor-tag">{{ study.year ?? '2024' }}</span>
              </div>
            </div>
          </NuxtLink>
        </li>
      </ol>

      <RevealOnView class="featured__see-all-wrap" :delay="0.2">
        <NuxtLink :to="localePath('/work')" class="featured__see-all">
          → {{ t('featured.see_all') }}
        </NuxtLink>
      </RevealOnView>
    </div>
  </section>
</template>

<style scoped>
.featured {
  padding: 8rem 0 6rem;
  position: relative;
}

.featured__head {
  margin-bottom: 4rem;
}
.featured__title {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-size: clamp(2.5rem, 5vw, 4.25rem);
  line-height: 1.0;
  letter-spacing: -0.035em;
  color: var(--text);
  margin: 0.75rem 0 0;
}
.featured__title em {
  display: block;
  font-family: theme('fontFamily.editorial');
  font-style: italic;
  font-weight: 400;
  color: var(--text-mute);
  font-size: 0.65em;
  margin-top: 0.15em;
  letter-spacing: -0.015em;
}

.featured__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.entry {
  border-top: 1px solid var(--border-strong);
}
.entry:last-child {
  border-bottom: 1px solid var(--border-strong);
}

.entry__link {
  display: grid;
  grid-template-columns: 110px 1fr 220px;
  align-items: start;
  gap: 2.5rem;
  padding: 3rem 0;
  text-decoration: none;
  color: inherit;
  position: relative;
  transition: padding 350ms cubic-bezier(0.22, 1, 0.36, 1);
}
.entry__link::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--bg-raised);
  opacity: 0;
  transition: opacity 250ms;
  z-index: -1;
}
.entry__link:hover::after { opacity: 0.5; }
.entry__link:hover { padding-left: 1.25rem; padding-right: 1.25rem; }

@media (max-width: 880px) {
  .entry__link {
    grid-template-columns: 60px 1fr;
    gap: 1.25rem;
    padding: 2.25rem 0;
  }
  .entry__preview { display: none; }
}

.entry__num {
  display: flex;
  flex-direction: column;
  font-family: theme('fontFamily.editorial');
  color: var(--text-soft);
}
.entry__num-pre {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}
.entry__num-val {
  font-size: clamp(3rem, 5vw, 4.5rem);
  font-style: italic;
  line-height: 0.9;
  color: var(--accent);
  margin-top: -0.1em;
  transition: transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
}
.entry__link:hover .entry__num-val {
  transform: translateX(8px);
}

.entry__body {
  display: flex;
  flex-direction: column;
  max-width: 64ch;
}
.entry__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0 0 1rem;
}
.entry__title {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--text);
  margin: 0;
  transition: color 300ms;
}
.entry__link:hover .entry__title { color: var(--accent); }

.entry__excerpt {
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  line-height: 1.55;
  color: var(--text-mute);
  margin: 1rem 0 0;
  max-width: 52ch;
}

.entry__bottom {
  display: flex;
  align-items: baseline;
  gap: 2.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}
.entry__result {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.entry__result-val {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  letter-spacing: -0.025em;
  font-size: 2rem;
  color: var(--text);
  line-height: 1;
}
.entry__result-lbl {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: lowercase;
  max-width: 12ch;
}
.entry__stack {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-mute);
  margin: 0;
  letter-spacing: 0.02em;
}
.entry__cta {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text);
}
.entry__cta-arrow {
  display: inline-block;
  transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
}
.entry__link:hover .entry__cta-arrow {
  transform: translate(4px, -4px);
  color: var(--accent);
}

/* Preview */
.entry__preview {
  align-self: stretch;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}
.entry__preview-img-wrap {
  width: 220px;
  height: 140px;
  border: 1px solid var(--border);
  padding: 0.35rem;
  background: var(--bg-overlay);
  overflow: hidden;
  position: relative;
  transition: border-color 250ms, transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
}
.entry__link:hover .entry__preview-img-wrap {
  border-color: var(--accent);
  transform: translateY(-4px);
}
.entry__preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: saturate(0.88) contrast(1.02);
  transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1), filter 250ms;
}
.entry__link:hover .entry__preview-img {
  transform: scale(1.06);
  filter: saturate(1.02);
}

.entry__decor {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}
.entry__decor-line {
  display: block;
  width: 1px;
  height: 80px;
  background: var(--border-strong);
}
.entry__decor-tag {
  font-family: theme('fontFamily.mono');
  font-size: 0.625rem;
  letter-spacing: 0.18em;
  color: var(--text-soft);
}

.featured__see-all-wrap {
  margin-top: 3rem;
}
.featured__see-all {
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
  letter-spacing: 0.08em;
  color: var(--text);
  text-decoration: none;
  border-bottom: 1px solid var(--text);
  padding-bottom: 3px;
  transition: color 200ms, border-color 200ms;
}
.featured__see-all:hover {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
</style>
