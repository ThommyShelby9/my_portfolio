<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => `${t('contact.title')} — ${t('site.name')}`,
  description: () => t('contact.intro'),
})

const channels = computed(() => [
  { label: t('contact.email_label'), href: 'mailto:rmissimawu@gmail.com', value: 'rmissimawu@gmail.com', tag: 'preferred' },
  { label: t('contact.linkedin_label'), href: 'https://www.linkedin.com/in/rostelpanoumassi-6b6608335', value: '@rostelpanoumassi', tag: 'pro' },
  { label: t('contact.calendly_label'), href: 'https://calendly.com/rostelpanoumassi', value: 'calendly.com/rostelpanoumassi', tag: '30 min' },
])

const heroProps = computed(() => locale.value === 'en'
  ? { num: '04', kicker: 'Reach · Talk · Schedule', title: 'Let\'s', emphasis: 'talk.' }
  : { num: '04', kicker: 'Contact · Échanger · Planifier', title: 'Parlons-', emphasis: 'nous.' },
)
</script>

<template>
  <article class="contact">
    <PageHero v-bind="heroProps" :sub="t('contact.intro')" />

    <div class="contact__inner container-narrow">
      <RevealOnView class="contact__cta-wrap">
        <NuxtLink :to="localePath('/brief')" class="contact__cta" data-cursor="text" :data-cursor-label="locale === 'en' ? 'start' : 'go'">
          <span class="contact__cta-num">01</span>
          <span class="contact__cta-text">{{ t('cta_block.cta') }}</span>
          <span class="contact__cta-arrow">→</span>
        </NuxtLink>
        <p class="contact__cta-note">
          {{ locale === 'en' ? 'Fastest route — 5 minutes, reply within 48h.' : 'La voie la plus rapide — 5 minutes, réponse sous 48h ouvrées.' }}
        </p>
      </RevealOnView>

      <ul class="contact__channels">
        <RevealOnView
          v-for="(c, i) in channels"
          :key="c.label"
          as="li"
          :delay="i * 0.08"
          class="contact__row"
        >
          <a :href="c.href" target="_blank" rel="noopener noreferrer" class="contact__row-link">
            <span class="contact__row-label">{{ c.label }}</span>
            <span class="contact__row-value">
              <span>{{ c.value }}</span>
              <em class="contact__row-tag">— {{ c.tag }}</em>
            </span>
            <span class="contact__row-arrow" aria-hidden="true">↗</span>
          </a>
        </RevealOnView>
        <RevealOnView as="li" :delay="0.3" class="contact__row contact__row--meta">
          <span class="contact__row-label">{{ locale === 'en' ? 'Where' : 'Où' }}</span>
          <span class="contact__row-value">
            <span>{{ t('contact.location') }}</span>
            <em class="contact__row-tag">— {{ locale === 'en' ? 'always responsive' : 'toujours joignable' }}</em>
          </span>
        </RevealOnView>
      </ul>
    </div>
  </article>
</template>

<style scoped>
.contact__inner {
  padding: 4rem 0 8rem;
}

.contact__cta-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 5rem;
}

.contact__cta {
  display: inline-grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1.5rem;
  background: var(--text);
  color: var(--bg);
  padding: 1.5rem 2rem;
  text-decoration: none;
  font-family: theme('fontFamily.display');
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  letter-spacing: -0.015em;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  max-width: 32rem;
  transition: color 350ms;
}
.contact__cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  transform: translateY(100%);
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;
}
.contact__cta:hover { color: var(--accent-ink); }
.contact__cta:hover::before { transform: translateY(0); }
.contact__cta > * { position: relative; z-index: 1; }

.contact__cta-num {
  font-family: theme('fontFamily.editorial');
  font-size: 1em;
  opacity: 0.5;
}
.contact__cta-arrow {
  transition: transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
}
.contact__cta:hover .contact__cta-arrow {
  transform: translateX(8px);
}

.contact__cta-note {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-soft);
  letter-spacing: 0.04em;
  margin: 0;
}

.contact__channels {
  list-style: none;
  padding: 0;
  margin: 0;
}

.contact__row {
  border-top: 1px solid var(--border);
}
.contact__row:last-child {
  border-bottom: 1px solid var(--border);
}

.contact__row-link,
.contact__row {
  display: grid;
}
.contact__row-link {
  grid-template-columns: 12rem 1fr auto;
  gap: 2rem;
  align-items: center;
  padding: 1.75rem 0;
  font-family: theme('fontFamily.body');
  text-decoration: none;
  color: var(--text);
  transition: background 200ms, padding 250ms;
}
.contact__row-link:hover {
  padding-left: 1rem;
  padding-right: 1rem;
  background: var(--bg-raised);
}

.contact__row--meta {
  grid-template-columns: 12rem 1fr;
  gap: 2rem;
  align-items: center;
  padding: 1.75rem 0;
  color: var(--text);
}

.contact__row-label {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-soft);
}

.contact__row-value {
  display: inline-flex;
  align-items: baseline;
  gap: 0.75rem;
  font-size: 1.125rem;
  color: var(--text);
  flex-wrap: wrap;
}
.contact__row-tag {
  font-family: theme('fontFamily.editorial');
  color: var(--text-soft);
  font-size: 0.9em;
}

.contact__row-arrow {
  font-family: theme('fontFamily.mono');
  font-size: 1.125rem;
  color: var(--text-soft);
  transition: transform 250ms, color 250ms;
}
.contact__row-link:hover .contact__row-arrow {
  transform: translate(4px, -4px);
  color: var(--accent);
}

@media (max-width: 600px) {
  .contact__row-link,
  .contact__row--meta {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  .contact__row-arrow { display: none; }
}
</style>
