<script setup lang="ts">
import { bootHomeAnimations, bootParallax, type HomeAnimController } from '~/assets/animations/home'

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

const issue = computed(() => locale.value === 'en' ? 'Issue 03 — May 2026 — Vol. III' : 'Numéro 03 — Mai 2026 — Vol. III')
const meta = computed(() => locale.value === 'en' ? '11 products · 5 years · 11 case studies' : '11 produits · 5 ans · 11 case studies')

let animCtrl: HomeAnimController | null = null
let parallaxCtrl: HomeAnimController | null = null
onMounted(() => {
  // Defer to next frame so all sections are in DOM
  requestAnimationFrame(() => {
    animCtrl = bootHomeAnimations()
    parallaxCtrl = bootParallax()
  })
})
onBeforeUnmount(() => {
  animCtrl?.destroy()
  parallaxCtrl?.destroy()
})
</script>

<template>
  <div class="home">
    <!-- HERO -->
    <section class="hero" aria-labelledby="hero-heading">
      <HeroConstellation />

      <div class="hero__grid container-narrow">
        <!-- top strip -->
        <div class="hero__strip">
          <span class="hero__issue">/ {{ issue }}</span>
          <span class="hero__strip-sep" aria-hidden="true" />
          <span class="hero__loc">Cotonou — Bénin — UTC+1</span>
        </div>

        <!-- main title -->
        <div class="hero__title-wrap">
          <h1 id="hero-heading" class="hero__title">
            <span class="hero__title-line hero__title-line--hi">
              <SplitText :text="locale === 'en' ? 'Software' : 'Du logiciel'" tag="span" :stagger="0.06" />
            </span>
            <span class="hero__title-line hero__title-line--em">
              <SplitText :text="locale === 'en' ? 'that holds.' : 'qui tient.'" tag="span" :delay="0.2" :stagger="0.06" />
            </span>
            <span class="hero__title-line hero__title-line--sub">
              <SplitText :text="locale === 'en' ? 'For teams who cannot afford to fail.' : 'Pour les équipes qui n\'ont pas droit à l\'erreur.'" tag="span" :delay="0.45" :stagger="0.04" />
            </span>
          </h1>
        </div>

        <!-- right column -->
        <aside class="hero__panel">
          <HeroStatusCard />
        </aside>

        <!-- subtitle + CTAs -->
        <div class="hero__below">
          <RevealOnView :delay="0.3" class="hero__sub-wrap">
            <p class="hero__sub">
              {{ locale === 'en'
                ? 'Lead Engineering at KPS Groupe — two missions per quarter, picked on fit. Fintech, data, B2B platforms.'
                : 'Lead Engineering chez KPS Groupe. Deux missions par trimestre, sélectionnées au cas par cas. Fintech, data, plateformes B2B.' }}
            </p>
          </RevealOnView>

          <RevealOnView :delay="0.45" class="hero__actions">
            <MagneticLink :to="localePath('/brief')" class="hero__cta hero__cta--primary">
              <span>{{ t('hero.cta_primary') }}</span>
            </MagneticLink>
            <MagneticLink :to="localePath('/work')" class="hero__cta hero__cta--ghost">
              <span class="hero__cta-arrow" aria-hidden="true">↓</span>
              <span>{{ locale === 'en' ? 'See the work' : 'Voir les travaux' }}</span>
            </MagneticLink>
          </RevealOnView>
        </div>

        <!-- scroll indicator -->
        <div class="hero__scroll" aria-hidden="true">
          <span class="hero__scroll-txt">{{ locale === 'en' ? 'Scroll' : 'Défile' }}</span>
          <span class="hero__scroll-line" />
        </div>

        <div class="hero__bottom-meta">
          <span>{{ meta }}</span>
          <span>— v3.1 ·</span>
          <a :href="`mailto:rmissimawu@gmail.com`" class="hero__email" data-cursor="text" :data-cursor-label="locale === 'en' ? 'write' : 'écris'">rmissimawu@gmail.com</a>
        </div>
      </div>
    </section>

    <!-- FEATURED WORK -->
    <FeaturedWork />

    <!-- APPROACH -->
    <ApproachBlock />

    <!-- LAB / NOW -->
    <LabBlock />

    <!-- CTA -->
    <CtaBlock />
  </div>
</template>

<style scoped>
.home {
  --hero-pad-top: 7rem;
  --hero-pad-bottom: 4rem;
}

/* HERO ====================================== */
.hero {
  position: relative;
  min-height: calc(100dvh - 64px);
  padding: var(--hero-pad-top) 0 var(--hero-pad-bottom);
  overflow: hidden;
}


.hero__grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  grid-template-areas:
    "strip strip"
    "title panel"
    "below panel"
    "scroll bottom";
  gap: 2.5rem 3rem;
  align-items: start;
}

@media (max-width: 980px) {
  .hero__grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      "strip"
      "title"
      "panel"
      "below"
      "scroll"
      "bottom";
    gap: 2rem;
  }
  .home {
    --hero-pad-top: 5rem;
  }
}

.hero__strip {
  grid-area: strip;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-soft);
}
.hero__issue { color: var(--accent); }
.hero__strip-sep {
  width: 80px;
  height: 1px;
  background: var(--border-strong);
}

.hero__title-wrap {
  grid-area: title;
  align-self: end;
}
.hero__title {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-style: normal;
  line-height: 0.95;
  letter-spacing: -0.045em;
  color: var(--text);
  margin: 0;
  font-variation-settings: 'wdth' 95, 'opsz' 96;
}

.hero__title-line {
  display: block;
}

.hero__title-line--hi {
  font-size: clamp(3rem, 8.5vw, 8rem);
  font-weight: 700;
  letter-spacing: -0.04em;
}
.hero__title-line--em {
  font-family: theme('fontFamily.display');
  font-weight: 500;
  font-style: normal;
  font-size: clamp(3rem, 8.5vw, 8rem);
  color: var(--accent);
  letter-spacing: -0.04em;
  line-height: 0.96;
}
.hero__title-line--sub {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  letter-spacing: -0.015em;
  color: var(--text-mute);
  margin-top: 1.25em;
  line-height: 1.25;
  max-width: 22ch;
}

/* Panel */
.hero__panel {
  grid-area: panel;
  align-self: start;
  margin-top: 2rem;
  max-width: 380px;
  width: 100%;
  justify-self: end;
}
@media (max-width: 980px) {
  .hero__panel {
    justify-self: start;
    margin-top: 0;
    max-width: 100%;
  }
}

/* Below */
.hero__below { grid-area: below; max-width: 56ch; }
.hero__sub-wrap { margin-bottom: 2.25rem; }
.hero__sub {
  font-family: theme('fontFamily.body');
  font-size: clamp(1rem, 1.2vw, 1.0625rem);
  line-height: 1.55;
  color: var(--text-mute);
  margin: 0;
  max-width: 44ch;
}

.hero__actions {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}
.hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  transition: color 250ms;
  cursor: pointer;
}
.hero__cta--primary {
  background: var(--accent);
  color: var(--accent-ink);
  padding: 1rem 1.4rem;
  border-radius: 999px;
  position: relative;
  overflow: hidden;
}
.hero__cta--primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--text);
  transform: translateY(100%);
  transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;
}
.hero__cta--primary > span { position: relative; z-index: 1; }
.hero__cta--primary:hover { color: var(--bg); }
.hero__cta--primary:hover::before { transform: translateY(0); }

.hero__cta--ghost {
  color: var(--text);
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-strong);
}
.hero__cta--ghost:hover { color: var(--accent); border-bottom-color: var(--accent); }
.hero__cta-arrow {
  display: inline-block;
  animation: bob 2s ease-in-out infinite;
}
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}

/* Scroll indicator */
.hero__scroll {
  grid-area: scroll;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 3rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.625rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-soft);
}
.hero__scroll-line {
  display: block;
  width: 1px;
  height: 60px;
  background: var(--text-soft);
  transform-origin: top;
  animation: scroll-line 2.4s ease-in-out infinite;
}
@keyframes scroll-line {
  0%, 100% { transform: scaleY(1); opacity: 0.6; }
  50% { transform: scaleY(1.6); opacity: 1; }
}

/* Bottom meta */
.hero__bottom-meta {
  grid-area: bottom;
  align-self: end;
  justify-self: end;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: var(--text-soft);
}
.hero__email { color: var(--accent); text-decoration: none; }
.hero__email:hover { color: var(--text); }

@media (max-width: 980px) {
  .hero__bottom-meta { justify-self: start; }
}
</style>
