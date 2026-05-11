<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="cta" aria-labelledby="cta-heading">
    <div class="cta__inner container-narrow">
      <p class="mono-tag cta__num">/ 05 — {{ locale === 'en' ? 'YOUR MOVE' : 'À TOI' }}</p>

      <RevealOnView class="cta__hero">
        <h2 id="cta-heading" class="cta__title">
          <span>{{ locale === 'en' ? 'Got a' : 'Un' }}</span>
          <em class="editorial">{{ locale === 'en' ? 'project' : 'projet' }}</em>
          <span>{{ locale === 'en' ? 'in mind?' : 'en tête ?' }}</span>
        </h2>
        <p class="cta__sub">{{ t('cta_block.sub') }}</p>
      </RevealOnView>

      <RevealOnView class="cta__actions" :delay="0.15">
        <MagneticLink :to="localePath('/brief')" class="cta__primary">
          <span>{{ t('cta_block.cta') }}</span>
          <span class="cta__arrow">→</span>
        </MagneticLink>
        <a href="mailto:rmissimawu@gmail.com" class="cta__email" data-cursor="text" :data-cursor-label="locale === 'en' ? 'mail' : 'écris'">
          <span>{{ locale === 'en' ? 'or write directly:' : 'ou écris-moi :' }}</span>
          <em>rmissimawu@gmail.com</em>
        </a>
      </RevealOnView>

      <div class="cta__corners" aria-hidden="true">
        <span class="cta__tick cta__tick--tl" />
        <span class="cta__tick cta__tick--tr" />
        <span class="cta__tick cta__tick--bl" />
        <span class="cta__tick cta__tick--br" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  padding: 10rem 0 8rem;
  border-top: 1px solid var(--border);
  position: relative;
}

.cta__inner {
  text-align: center;
  position: relative;
}

.cta__num {
  margin: 0 0 2.5rem;
}

.cta__hero {
  max-width: 24ch;
  margin: 0 auto;
}

.cta__title {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(3rem, 8vw, 7rem);
  line-height: 0.95;
  letter-spacing: -0.025em;
  color: var(--text);
  margin: 0;
}
.cta__title span { display: inline-block; }
.cta__title em {
  display: inline-block;
  margin: 0 0.1em;
  font-family: theme('fontFamily.editorial');
  font-style: italic;
  color: var(--accent);
}

.cta__sub {
  font-family: theme('fontFamily.body');
  font-size: clamp(1rem, 1.2vw, 1.125rem);
  line-height: 1.55;
  color: var(--text-mute);
  max-width: 32rem;
  margin: 2rem auto 0;
}

.cta__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-top: 3.5rem;
}

.cta__primary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.1rem 1.75rem;
  background: var(--text);
  color: var(--bg);
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 999px;
  position: relative;
  overflow: hidden;
  transition: color 250ms;
}
.cta__primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  transform: translateY(100%);
  transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;
}
.cta__primary:hover { color: var(--accent-ink); }
.cta__primary:hover::before { transform: translateY(0); }
.cta__primary > * { position: relative; z-index: 1; }
.cta__arrow {
  display: inline-block;
  transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
}
.cta__primary:hover .cta__arrow {
  transform: translateX(4px);
}

.cta__email {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  font-family: theme('fontFamily.body');
  font-size: 0.9375rem;
  color: var(--text-mute);
  text-decoration: none;
}
.cta__email em {
  font-family: theme('fontFamily.editorial');
  font-style: italic;
  color: var(--text);
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 1px;
  transition: color 200ms, border-color 200ms;
}
.cta__email:hover em {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

/* corner ticks */
.cta__corners {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.cta__tick {
  position: absolute;
  width: 18px;
  height: 18px;
  border-color: var(--text-soft);
}
.cta__tick--tl { top: -10px; left: 0; border-top: 1px solid; border-left: 1px solid; }
.cta__tick--tr { top: -10px; right: 0; border-top: 1px solid; border-right: 1px solid; }
.cta__tick--bl { bottom: -10px; left: 0; border-bottom: 1px solid; border-left: 1px solid; }
.cta__tick--br { bottom: -10px; right: 0; border-bottom: 1px solid; border-right: 1px solid; }
</style>
