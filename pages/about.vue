<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: page } = await useAsyncData(
  () => `about-${locale.value}`,
  () => queryCollection('pages')
    .where('path', '=', `/${locale.value}/about`)
    .first(),
  { watch: [locale] },
)

useSeoMeta({
  title: () => `${(page.value as any)?.title ?? t('about.title')} — ${t('site.name')}`,
  description: () => (page.value as any)?.description,
})

const heroProps = computed(() => locale.value === 'en'
  ? { num: '03', kicker: 'Method · Story · Lab', title: 'Behind', emphasis: 'the work.' }
  : { num: '03', kicker: 'Méthode · Parcours · Atelier', title: 'Derrière', emphasis: 'le travail.' },
)

const projects = [
  { img: '/images/freelanceclub.png', slug: 'freelanceclub', title: 'Freelance Club', tag: 'Portage salarial · SaaS' },
  { img: '/images/ubbfy.png', slug: 'ubbfy', title: 'Ubbfy', tag: 'ERP · Web + Mobile' },
  { img: '/images/tadagberhplus.png', slug: 'tadagberhplus', title: 'Tadagbe RH+', tag: 'SIRH · 100+ entreprises' },
  { img: '/images/ccns.png', slug: 'ccns', title: 'CCNS Bénin', tag: 'Santé · Institutionnel' },
  { img: '/images/whatspay.png', slug: 'whatspay', title: 'WhatsPay', tag: 'MarTech · WhatsApp' },
  { img: '/images/leconsultant.png', slug: 'leconsultant', title: 'LeConsultant', tag: 'B2B · Appels d\'offres' },
  { img: '/images/bilal_portfolio.png', slug: 'bilalsekou', title: 'Bilal Sekou', tag: 'Portfolio · E-book' },
  { img: '/images/easytowork.png', slug: 'easytowork', title: 'EasyToWork', tag: 'Multi-marques KPS' },
  { img: '/images/planus.png', slug: 'planus', title: 'Planus Analytics', tag: 'Corporate · 2FA' },
  { img: '/images/portfolio_mariette.png', slug: 'mariette', title: 'Mariette Nobre', tag: 'Blog · Next.js' },
  { img: '/images/zenlife.png', slug: 'zenlife', title: 'ZenLife', tag: 'Side project · Wellness' },
]

const tale = computed(() => locale.value === 'en'
  ? {
      eyebrow: '— A short story',
      head: 'Reliable software is mostly listening.',
      body: 'I learned web and mobile development at École 229 in Cotonou, picked up cybersecurity at ASIN, and have been shipping production systems since. I lead the engineering team at KPS Groupe today — fintech, HR, B2B, healthcare, marketing. The common thread is not the stack — it is the discipline of removing what is not essential before adding what is.',
    }
  : {
      eyebrow: '— Une histoire courte',
      head: 'Un logiciel qui tient, c\'est surtout savoir écouter.',
      body: 'J\'ai appris le développement web et mobile à l\'École 229 à Cotonou, complété par la cybersécurité avec l\'ASIN, et je livre du logiciel en production depuis. Je pilote aujourd\'hui l\'ingénierie de KPS Groupe — fintech, RH, B2B, santé, marketing. Le fil rouge n\'est pas la stack : c\'est la discipline d\'enlever ce qui n\'est pas essentiel avant d\'ajouter quoi que ce soit.',
    },
)

const facts = computed(() => locale.value === 'en'
  ? [
      { k: '10+', v: 'products shipped' },
      { k: '5 yrs', v: 'in production' },
      { k: '0', v: 'silent handovers' },
      { k: 'KPS', v: 'leading engineering since 2025' },
    ]
  : [
      { k: '10+', v: 'produits livrés' },
      { k: '5 ans', v: 'en production' },
      { k: '0', v: 'passation silencieuse' },
      { k: 'KPS', v: 'lead ingénierie depuis 2025' },
    ],
)
</script>

<template>
  <article class="about">
    <PageHero v-bind="heroProps" />

    <!-- Portrait + intro -->
    <section class="about-portrait container-narrow">
      <RevealOnView class="about-portrait__frame">
        <div class="about-portrait__photo-wrap" data-parallax="0.05">
          <img
            src="/images/profile.jpg"
            alt="Rostel Panoumassi"
            width="640"
            height="800"
            class="about-portrait__photo"
          >
          <div class="about-portrait__caption">
            <span>R. Panoumassi</span>
            <em>— Cotonou, 2026</em>
          </div>
        </div>
      </RevealOnView>

      <RevealOnView class="about-portrait__intro" :delay="0.15">
        <p class="mono-tag">{{ tale.eyebrow }}</p>
        <h2 class="about-portrait__head">{{ tale.head }}</h2>
        <p class="about-portrait__body">{{ tale.body }}</p>

        <ul class="about-portrait__facts">
          <li v-for="(f, i) in facts" :key="i">
            <span class="about-portrait__fact-k" data-count>{{ f.k }}</span>
            <span class="about-portrait__fact-v">{{ f.v }}</span>
          </li>
        </ul>
      </RevealOnView>
    </section>

    <!-- Project gallery -->
    <section class="about-gallery">
      <div class="container-narrow">
        <RevealOnView class="about-gallery__head">
          <p class="mono-tag">/ {{ locale === 'en' ? 'GALLERY — SHIPPED' : 'GALERIE — LIVRÉS' }}</p>
          <h2 class="about-gallery__title">
            {{ locale === 'en' ? 'A few' : 'Quelques' }}
            <em class="editorial">{{ locale === 'en' ? 'pieces' : 'pièces' }}</em>
          </h2>
        </RevealOnView>
      </div>

      <div class="gallery-scroll no-scrollbar" data-gallery>
        <div class="gallery-track" data-stagger>
          <RevealOnView
            v-for="(p, i) in projects"
            :key="i"
            as="article"
            :delay="i * 0.04"
            class="gallery-card"
          >
            <NuxtLink :to="localePath(`/work/${p.slug}`)" class="gallery-card__link" data-cursor="text" :data-cursor-label="locale === 'en' ? 'view' : 'voir'">
              <div class="gallery-card__img-wrap">
                <img
                  :src="p.img"
                  :alt="p.title"
                  width="640"
                  height="400"
                  loading="lazy"
                  class="gallery-card__img"
                >
              </div>
              <header class="gallery-card__head">
                <h3>{{ p.title }}</h3>
                <p>{{ p.tag }}</p>
              </header>
            </NuxtLink>
          </RevealOnView>
        </div>
      </div>

      <div class="container-narrow">
        <RevealOnView class="about-gallery__cta">
          <NuxtLink :to="localePath('/work')" class="btn-ghost">
            {{ locale === 'en' ? 'See all case studies →' : 'Voir tous les case studies →' }}
          </NuxtLink>
        </RevealOnView>
      </div>
    </section>

    <!-- Body content from MD -->
    <section class="about-body container-narrow">
      <div v-if="page" class="about-body__inner">
        <ContentRenderer :value="(page as any)" />
      </div>
    </section>

    <!-- Talk-with -->
    <section class="about-cta container-narrow">
      <RevealOnView class="about-cta__inner">
        <p class="mono-tag">— {{ locale === 'en' ? 'NEXT' : 'SUITE' }}</p>
        <h2 class="about-cta__title">
          {{ locale === 'en' ? 'Read the work, or' : 'Lis les travaux,' }}
          <em class="editorial">{{ locale === 'en' ? 'start a brief.' : 'ou démarre un brief.' }}</em>
        </h2>
        <div class="about-cta__actions">
          <NuxtLink :to="localePath('/work')" class="about-cta__btn about-cta__btn--ghost">{{ locale === 'en' ? 'See the work' : 'Voir les travaux' }} →</NuxtLink>
          <NuxtLink :to="localePath('/brief')" class="about-cta__btn about-cta__btn--filled">{{ t('cta_block.cta') }} →</NuxtLink>
        </div>
      </RevealOnView>
    </section>
  </article>
</template>

<style scoped>
/* Portrait =================================== */
.about-portrait {
  padding: 6rem 1.5rem 4rem;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 4rem;
  align-items: start;
}
@media (max-width: 900px) {
  .about-portrait {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}

.about-portrait__frame {
  position: sticky;
  top: 6rem;
}

.about-portrait__photo-wrap {
  position: relative;
  border: 1px solid var(--border-strong);
  padding: 0.5rem;
  background: var(--bg-overlay);
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
}

.about-portrait__photo {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  filter: saturate(0.95) contrast(1.04);
  aspect-ratio: 4 / 5;
}

.about-portrait__caption {
  position: absolute;
  left: 1rem;
  bottom: -12px;
  background: var(--bg);
  padding: 0.35rem 0.6rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  color: var(--text);
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
}
.about-portrait__caption em {
  font-family: theme('fontFamily.editorial');
  color: var(--text-soft);
  font-size: 0.95em;
}

.about-portrait__intro {
  padding-top: 0.5rem;
}
.about-portrait__head {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-size: clamp(2rem, 4.5vw, 3.75rem);
  line-height: 1.0;
  letter-spacing: -0.035em;
  color: var(--text);
  margin: 1rem 0 1.5rem;
  max-width: 22ch;
}

.about-portrait__body {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--text-mute);
  margin: 0 0 2.5rem;
  max-width: 56ch;
}

.about-portrait__facts {
  list-style: none;
  padding: 0;
  margin: 2.5rem 0 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  border-top: 1px solid var(--border);
  padding-top: 2rem;
}
.about-portrait__facts li {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.about-portrait__fact-k {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-size: clamp(1.875rem, 4vw, 2.75rem);
  letter-spacing: -0.025em;
  color: var(--accent);
  line-height: 1;
}
.about-portrait__fact-v {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--text-soft);
}

/* Gallery =================================== */
.about-gallery {
  padding: 6rem 0 4rem;
  border-top: 1px solid var(--border);
  background: var(--bg-paper);
  overflow: hidden;
}
.about-gallery__head { margin-bottom: 3rem; }
.about-gallery__title {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1.0;
  letter-spacing: -0.035em;
  color: var(--text);
  margin: 0.75rem 0 0;
}
.about-gallery__title em {
  font-family: theme('fontFamily.editorial');
  font-weight: 400;
  color: var(--accent);
  margin-left: 0.25em;
}

.gallery-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 max(1.5rem, calc((100vw - 1280px) / 2)) 1rem;
  scroll-snap-type: x mandatory;
}

.gallery-track {
  display: flex;
  gap: 1.25rem;
  width: max-content;
  padding-bottom: 1rem;
}

.gallery-card {
  flex: 0 0 320px;
  scroll-snap-align: start;
}
@media (max-width: 600px) {
  .gallery-card { flex-basis: 260px; }
}

.gallery-card__link {
  display: block;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.gallery-card__img-wrap {
  position: relative;
  border: 1px solid var(--border);
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: var(--bg-overlay);
  transition: border-color 250ms, transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
}
.gallery-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.9) contrast(1.02);
  transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1), filter 350ms;
}
.gallery-card__link:hover .gallery-card__img-wrap {
  border-color: var(--accent);
  transform: translateY(-4px);
}
.gallery-card__link:hover .gallery-card__img {
  transform: scale(1.05);
  filter: saturate(1.05) contrast(1.05);
}

.gallery-card__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}
.gallery-card__head h3 {
  font-family: theme('fontFamily.display');
  font-weight: 500;
  font-size: 1.1875rem;
  letter-spacing: -0.015em;
  color: var(--text);
  margin: 0;
  transition: color 250ms;
}
.gallery-card__head p {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}
.gallery-card__link:hover h3 { color: var(--accent); }

.about-gallery__cta {
  margin-top: 2rem;
}

/* Body content (markdown) =================================== */
.about-body {
  padding: 5rem 1.5rem 3rem;
}
.about-body__inner {
  max-width: 64ch;
}

.about-body__inner :deep(h2),
.about-body__inner :deep(h2 a) {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-size: clamp(1.625rem, 3vw, 2.25rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--text);
  text-decoration: none;
}
.about-body__inner :deep(h2) {
  margin: 3.5rem 0 1.25rem;
}
.about-body__inner :deep(h2:first-child) { margin-top: 0; }

.about-body__inner :deep(h3),
.about-body__inner :deep(h3 a) {
  font-family: theme('fontFamily.display');
  font-weight: 500;
  font-size: 1.25rem;
  letter-spacing: -0.015em;
  color: var(--text);
  text-decoration: none;
}
.about-body__inner :deep(h3) {
  margin: 2.25rem 0 0.85rem;
}

.about-body__inner :deep(p) {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--text-mute);
  margin: 0 0 1.25rem;
}
.about-body__inner :deep(li) {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--text-mute);
  margin: 0 0 0.5rem;
}

.about-body__inner :deep(em) {
  font-family: theme('fontFamily.editorial');
  color: var(--accent);
}

.about-body__inner :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

.about-body__inner :deep(a) {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.about-body__inner :deep(h2 a),
.about-body__inner :deep(h3 a),
.about-body__inner :deep(h4 a) {
  color: inherit !important;
  text-decoration: none !important;
}

.about-body__inner :deep(ul) {
  list-style: none;
  padding: 0;
  margin: 1.25rem 0 1.75rem;
}
.about-body__inner :deep(ul li) {
  position: relative;
  padding-left: 1.5rem;
}
.about-body__inner :deep(ul li)::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--accent);
}

.about-body__inner :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
}
.about-body__inner :deep(th),
.about-body__inner :deep(td) {
  padding: 0.85rem 0.75rem;
  border-bottom: 1px solid var(--border);
  text-align: left;
  color: var(--text-mute);
}
.about-body__inner :deep(th) {
  color: var(--text-soft);
  font-weight: 500;
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-bottom-color: var(--border-strong);
}

/* About CTA =================================== */
.about-cta {
  padding: 5rem 1.5rem 8rem;
}
.about-cta__inner {
  text-align: left;
  border-top: 1px solid var(--border);
  padding-top: 4rem;
}
.about-cta__title {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-size: clamp(2.25rem, 5vw, 4rem);
  line-height: 1.0;
  letter-spacing: -0.035em;
  color: var(--text);
  margin: 1rem 0 2.5rem;
  max-width: 20ch;
}
.about-cta__title em {
  font-family: theme('fontFamily.editorial');
  font-weight: 400;
  color: var(--accent);
}

.about-cta__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
}

.about-cta__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 1rem 1.5rem;
  border-radius: 999px;
  transition: color 250ms, background 250ms, border-color 250ms;
}
.about-cta__btn--filled {
  background: var(--text);
  color: var(--bg);
  position: relative;
  overflow: hidden;
}
.about-cta__btn--filled::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  transform: translateY(100%);
  transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;
}
.about-cta__btn--filled > * { position: relative; z-index: 1; }
.about-cta__btn--filled:hover { color: var(--accent-ink); }
.about-cta__btn--filled:hover::before { transform: translateY(0); }

.about-cta__btn--ghost {
  color: var(--text);
  border: 1px solid var(--border-strong);
}
.about-cta__btn--ghost:hover {
  background: var(--text);
  color: var(--bg);
  border-color: var(--text);
}
</style>
