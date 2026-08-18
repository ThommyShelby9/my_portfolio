<script setup lang="ts">
import { bootHomeAnimations, type HomeAnimController } from '~/assets/animations/home'

const { t, locale } = useI18n()
const localePath = useLocalePath()

// Home — SEO-tuned title + description with real keywords for "Rostel Missimawu /
// Rostel Panoumassi / lead engineering Bénin / Cotonou / Django Vue".
const seoDescription = computed(() => locale.value === 'en'
  ? 'Rostel Panoumassi — Head of Engineering & Innovation at KPS Groupe (Cotonou, Benin). I design and ship reliable software for teams that cannot afford to fail. Available for two engagements per quarter — fintech, data, B2B platforms.'
  : 'Rostel Panoumassi — Lead Engineering & Innovation chez KPS Groupe (Cotonou, Bénin). Je conçois et livre des produits logiciels fiables pour des équipes qui n\'ont pas le droit à l\'erreur. Disponible pour deux missions par trimestre — fintech, data, plateformes B2B.',
)

useSeoMeta({
  titleTemplate: '%s',
  title: () => locale.value === 'en'
    ? 'Rostel Panoumassi — Lead Engineering (Cotonou, Benin)'
    : 'Rostel Panoumassi — Lead Engineering (Cotonou, Bénin)',
  description: () => seoDescription.value,
  ogTitle: () => locale.value === 'en'
    ? 'Rostel Panoumassi — Lead Engineering'
    : 'Rostel Panoumassi — Lead Engineering',
  ogDescription: () => seoDescription.value,
  ogType: 'website',
  keywords: () => locale.value === 'en'
    ? 'Rostel Panoumassi, Rostel Missimawu, lead engineering Benin, Cotonou developer, software architect, Django, Spring Boot, Vue.js, Nuxt, fintech, freelance lead engineer, KPS Groupe'
    : 'Rostel Panoumassi, Rostel Missimawu, lead engineering Bénin, développeur Cotonou, architecte logiciel, Django, Spring Boot, Vue.js, Nuxt, fintech, freelance lead engineer, KPS Groupe',
})

let animCtrl: HomeAnimController | null = null
const manifesto = useManifesto()
onMounted(() => {
  // Defer to next frame so all sections are in DOM
  requestAnimationFrame(() => {
    animCtrl = bootHomeAnimations()
  })
  manifesto.start()
})
onBeforeUnmount(() => {
  animCtrl?.destroy()
  manifesto.stop()
})
</script>

<template>
  <div class="home">
    <GargantuaStage />

    <!-- SCENE 0 — thesis (keeps #hero-heading) -->
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero__inner container-narrow">
        <p class="hero__eyebrow">{{ t('manifesto.hero_eyebrow') }}</p>
        <h1 id="hero-heading" class="hero__title">
          <span>{{ t('manifesto.hero_title_1') }}</span>
          <span class="hero__title--em">{{ t('manifesto.hero_title_2') }}</span>
        </h1>
        <p class="hero__sub">{{ t('manifesto.hero_sub') }}</p>
        <div class="hero__scroll" aria-hidden="true">
          <span>{{ t('manifesto.scroll') }}</span><span class="hero__scroll-arw">↓</span>
        </div>
      </div>
    </section>

    <!-- SCENES 1-4 — the crédo, engulfed -->
    <ManifestoScene :index="1" :kicker="t('manifesto.credo.c1.k')" :title="t('manifesto.credo.c1.t')" />
    <ManifestoScene :index="2" :kicker="t('manifesto.credo.c2.k')" :title="t('manifesto.credo.c2.t')" />
    <ManifestoScene :index="3" :kicker="t('manifesto.credo.c3.k')" :title="t('manifesto.credo.c3.t')" />
    <ManifestoScene :index="4" :kicker="t('manifesto.credo.c4.k')" :title="t('manifesto.credo.c4.t')" />

    <!-- PROOF — the work stands still while the creed is consumed -->
    <FeaturedWork />

    <!-- INVITATION -->
    <CtaBlock />
  </div>
</template>

<style scoped>
.home {
  position: relative;
  z-index: 2;
}

/* HERO — SCENE 0 (thesis) ====================================== */
.hero {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: grid;
  place-items: center;
}

.hero__inner {
  text-align: center;
}

.hero__eyebrow {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 1.5rem;
}

.hero__title {
  font-family: theme('fontFamily.editorial');
  font-weight: 400;
  font-size: clamp(2.8rem, 9vw, 6.5rem);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0;
}

.hero__title span {
  display: block;
}

.hero__title--em {
  color: var(--accent);
}

.hero__sub {
  font-family: theme('fontFamily.body');
  font-size: clamp(1rem, 1.4vw, 1.125rem);
  line-height: 1.55;
  color: var(--text-mute);
  max-width: 32ch;
  margin: 1.75rem auto 0;
}

.hero__scroll {
  margin-top: 4rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-soft);
}

.hero__scroll-arw {
  display: inline-block;
  animation: bob 2s ease-in-out infinite;
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}

@media (prefers-reduced-motion: reduce) {
  .hero__scroll-arw {
    animation: none;
  }
}
</style>
