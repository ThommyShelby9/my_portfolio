<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => `${t('contact.title')} — ${t('site.name')}`,
  description: () => t('contact.intro'),
})

const channels = [
  { label: t('contact.email_label'), href: 'mailto:rmissimawu@gmail.com', value: 'rmissimawu@gmail.com' },
  { label: t('contact.linkedin_label'), href: 'https://www.linkedin.com/in/rostelpanoumassi-6b6608335', value: '@rostelpanoumassi' },
  { label: t('contact.calendly_label'), href: 'https://calendly.com/rostelpanoumassi', value: 'calendly.com/rostelpanoumassi' },
]
</script>

<template>
  <article class="contact">
    <header class="contact__header">
      <p class="contact__kicker">/ {{ t('contact.title') }}</p>
      <h1 class="contact__title">{{ t('contact.title') }}</h1>
      <p class="contact__intro">{{ t('contact.intro') }}</p>
    </header>

    <NuxtLink :to="localePath('/brief')" class="contact__cta">
      → {{ t('cta_block.cta') }}
    </NuxtLink>

    <ul class="contact__channels">
      <li v-for="c in channels" :key="c.label" class="contact__row">
        <span class="contact__label">{{ c.label }}</span>
        <a :href="c.href" class="contact__value" target="_blank" rel="noopener noreferrer">{{ c.value }}</a>
      </li>
      <li class="contact__row">
        <span class="contact__label">{{ t('case_study.labels.duration') }}</span>
        <span class="contact__value">{{ t('contact.location') }}</span>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.contact {
  padding: 6rem 1.5rem;
  max-width: theme('maxWidth.reading');
  margin: 0 auto;
}

.contact__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}

.contact__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.05;
  font-weight: 400;
  margin: 1rem 0 0;
}

.contact__intro {
  font-family: theme('fontFamily.body');
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-mute);
  margin: 1rem 0 0;
}

.contact__cta {
  display: inline-block;
  margin-top: 3rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  color: var(--text);
  border-bottom: 1px solid var(--accent);
  padding-bottom: 4px;
  text-decoration: none;
  letter-spacing: 0.04em;
}

.contact__channels {
  list-style: none;
  padding: 0;
  margin: 4rem 0 0;
  border-top: 1px solid var(--border);
}

.contact__row {
  display: grid;
  grid-template-columns: 12rem 1fr;
  gap: 2rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--border);
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
}

@media (max-width: 600px) {
  .contact__row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}

.contact__label {
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.6875rem;
}

.contact__value {
  color: var(--text-mute);
  text-decoration: none;
}

.contact__value:hover {
  color: var(--text);
}
</style>
