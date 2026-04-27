<script setup lang="ts">
const { locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const wantsCall = computed(() => route.query.call === '1')

useSeoMeta({
  title: () => locale.value === 'en' ? 'Brief received — Rostel Panoumassi' : 'Brief reçu — Rostel Panoumassi',
  description: () => locale.value === 'en'
    ? 'Your brief is on its way. You will get a personal reply within 48 business hours.'
    : 'Ton brief est en route. Tu auras une réponse personnalisée sous 48h ouvrées.',
  robots: 'noindex',
})

definePageMeta({ layout: 'default' })

const calendlyUrl = 'https://calendly.com/rostelpanoumassi'

const labels = computed(() => locale.value === 'en'
  ? {
      kicker: '/ confirmation',
      title: 'Brief received.',
      body1: 'You will get a personal reply within 48 business hours.',
      body2: 'If I am not the right match, I will tell you in the same email — and recommend someone if I can.',
      callTitle: 'You asked for a call first',
      callBody: 'You can book directly here:',
      bookCall: 'Book a 30-min call',
      back: '← View case studies',
      urgency: 'In a hurry?',
      email: 'rmissimawu@gmail.com',
    }
  : {
      kicker: '/ confirmation',
      title: 'Brief reçu.',
      body1: 'Tu auras une réponse personnalisée sous 48h ouvrées.',
      body2: 'Si je ne suis pas le bon match, je te le dirai dans le même mail — et je te recommanderai quelqu\'un si je peux.',
      callTitle: 'Tu as demandé un appel d\'abord',
      callBody: 'Tu peux réserver directement ici :',
      bookCall: 'Réserver un appel de 30 min',
      back: '← Voir les case studies',
      urgency: 'En urgence ?',
      email: 'rmissimawu@gmail.com',
    })
</script>

<template>
  <article class="confirmation">
    <p class="confirmation__kicker">{{ labels.kicker }}</p>

    <h1 class="confirmation__title">{{ labels.title }}</h1>
    <p class="confirmation__body">{{ labels.body1 }}</p>
    <p class="confirmation__body">{{ labels.body2 }}</p>

    <div v-if="wantsCall" class="confirmation__call">
      <h2 class="confirmation__call-title">{{ labels.callTitle }}</h2>
      <p class="confirmation__body">{{ labels.callBody }}</p>
      <a :href="calendlyUrl" target="_blank" rel="noopener noreferrer" class="confirmation__cta">
        → {{ labels.bookCall }}
      </a>
    </div>

    <hr class="confirmation__rule">

    <div class="confirmation__after">
      <NuxtLink :to="localePath('/work')" class="confirmation__link">
        {{ labels.back }}
      </NuxtLink>
      <p class="confirmation__urgency">
        {{ labels.urgency }} <a :href="`mailto:${labels.email}`">{{ labels.email }}</a>
      </p>
    </div>
  </article>
</template>

<style scoped>
.confirmation {
  padding: 8rem 1.5rem;
  max-width: theme('maxWidth.reading');
  margin: 0 auto;
}

.confirmation__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}

.confirmation__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.05;
  font-weight: 400;
  margin: 1.5rem 0 2rem;
  color: var(--text);
}

.confirmation__body {
  font-family: theme('fontFamily.body');
  font-size: 1.125rem;
  line-height: 1.65;
  color: var(--text-mute);
  margin: 0 0 1rem;
  max-width: 36rem;
}

.confirmation__call {
  margin: 3rem 0 2rem;
  padding: 2rem;
  background: var(--accent-soft);
  border-left: 2px solid var(--accent);
  border-radius: 0 4px 4px 0;
}

.confirmation__call-title {
  font-family: theme('fontFamily.display');
  font-size: 1.5rem;
  line-height: 1.2;
  font-weight: 400;
  margin: 0 0 0.75rem;
  color: var(--text);
}

.confirmation__cta {
  display: inline-block;
  margin-top: 1rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  color: var(--text);
  border-bottom: 1px solid var(--accent);
  padding-bottom: 4px;
  text-decoration: none;
  letter-spacing: 0.04em;
}

.confirmation__rule {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 4rem 0 2rem;
}

.confirmation__after {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.confirmation__link {
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  color: var(--text-mute);
  text-decoration: none;
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 2px;
}

.confirmation__link:hover { color: var(--text); }

.confirmation__urgency {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-soft);
  margin: 0;
}

.confirmation__urgency a {
  color: var(--text-mute);
}
</style>
