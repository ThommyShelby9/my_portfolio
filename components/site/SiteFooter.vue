<script setup lang="ts">
const { t, locale } = useI18n()
const _ = t
const localePath = useLocalePath()
const year = new Date().getFullYear()

const cotonouTime = ref('')
let interval = 0
function updateTime() {
  cotonouTime.value = new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'fr-FR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Porto-Novo', hour12: false,
  }).format(new Date())
}

onMounted(() => {
  updateTime()
  interval = window.setInterval(updateTime, 1000)
})
onBeforeUnmount(() => clearInterval(interval))
</script>

<template>
  <footer class="site-footer" role="contentinfo">
    <div class="site-footer__inner container-narrow">
      <!-- Big monogram -->
      <div class="site-footer__brand">
        <p class="site-footer__signature">
          {{ locale === 'en' ? 'Signed by hand' : 'Signé à la main' }}
          <em class="editorial">— Cotonou {{ year }}</em>
        </p>
        <h2 class="site-footer__name">
          Rostel<span class="editorial">.Panoumassi</span>
        </h2>
      </div>

      <!-- Columns -->
      <div class="site-footer__cols">
        <div class="site-footer__col">
          <h3>{{ locale === 'en' ? 'Navigate' : 'Navigation' }}</h3>
          <ul>
            <li><NuxtLink :to="localePath('/')">{{ locale === 'en' ? 'Home' : 'Accueil' }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/work')">{{ locale === 'en' ? 'Work' : 'Travaux' }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/about')">{{ locale === 'en' ? 'Approach' : 'Approche' }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/contact')">Contact</NuxtLink></li>
            <li><NuxtLink :to="localePath('/brief')">{{ locale === 'en' ? 'Start a brief' : 'Démarrer un brief' }}</NuxtLink></li>
          </ul>
        </div>

        <div class="site-footer__col">
          <h3>{{ locale === 'en' ? 'Talk' : 'Échanger' }}</h3>
          <ul>
            <li><a href="mailto:rmissimawu@gmail.com">rmissimawu@gmail.com</a></li>
            <li><a href="https://www.linkedin.com/in/rostelpanoumassi-6b6608335" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
            <li><a href="https://github.com/ThommyShelby9" target="_blank" rel="noopener noreferrer">GitHub ↗</a></li>
            <li><a href="/cv.pdf" download>{{ locale === 'en' ? 'Download CV' : 'Télécharger CV' }}</a></li>
          </ul>
        </div>

        <div class="site-footer__col">
          <h3>{{ locale === 'en' ? 'Live' : 'Direct' }}</h3>
          <ul class="site-footer__live">
            <li>
              <span class="site-footer__chip site-footer__chip--avail" />
              {{ locale === 'en' ? 'Available · Q3 2026' : 'Dispo · Q3 2026' }}
            </li>
            <li>
              <span class="site-footer__chip" />
              {{ cotonouTime }} · UTC+1
            </li>
            <li>
              <span class="site-footer__chip" />
              {{ locale === 'en' ? '2 missions / quarter' : '2 missions / trimestre' }}
            </li>
          </ul>
        </div>

        <div class="site-footer__col">
          <h3>{{ locale === 'en' ? 'Legal' : 'Légal' }}</h3>
          <ul>
            <li><NuxtLink :to="localePath('/legal')">{{ locale === 'en' ? 'Imprint' : 'Mentions' }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/privacy')">{{ locale === 'en' ? 'Privacy' : 'Confidentialité' }}</NuxtLink></li>
          </ul>
        </div>
      </div>

      <!-- Bottom strip -->
      <div class="site-footer__bottom">
        <p class="site-footer__credit">
          {{ locale === 'en' ? 'Built in Cotonou' : 'Fait à Cotonou' }} · {{ year }} · v3.1
        </p>
        <NuxtLink :to="localePath('/terminal')" class="site-footer__easter" title="terminal">
          <span class="site-footer__easter-pre">$ </span>
          <span class="site-footer__easter-cmd">./terminal</span>
          <span class="site-footer__easter-cursor" aria-hidden="true" />
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--border);
  background:
    radial-gradient(800px 400px at 50% 0%, var(--bg-paper), transparent 70%),
    var(--bg);
  padding: 6rem 0 2.5rem;
  margin-top: 8rem;
  position: relative;
}

.site-footer__inner {
  display: flex;
  flex-direction: column;
  gap: 4.5rem;
}

/* Brand */
.site-footer__brand {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.site-footer__signature {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}
.site-footer__signature em {
  font-family: theme('fontFamily.editorial');
  text-transform: none;
  letter-spacing: 0;
  color: var(--accent);
  margin-left: 0.5rem;
}
.site-footer__name {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(3rem, 8vw, 8rem);
  line-height: 0.95;
  letter-spacing: -0.03em;
  color: var(--text);
  margin: 0;
}
.site-footer__name .editorial {
  font-family: theme('fontFamily.editorial');
  color: var(--text-mute);
  margin-left: -0.05em;
}

/* Cols */
.site-footer__cols {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}
@media (max-width: 720px) {
  .site-footer__cols {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}

.site-footer__col h3 {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0 0 1.25rem;
  font-weight: 500;
}

.site-footer__col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.site-footer__col a {
  font-family: theme('fontFamily.body');
  font-size: 0.875rem;
  color: var(--text-mute);
  text-decoration: none;
  transition: color 200ms;
  display: inline-block;
  position: relative;
}
.site-footer__col a:hover {
  color: var(--accent);
}
.site-footer__col a::before {
  content: '↳';
  margin-right: 0.4rem;
  opacity: 0;
  display: inline-block;
  transform: translateX(-6px);
  transition: opacity 200ms, transform 200ms;
  color: var(--accent);
}
.site-footer__col a:hover::before {
  opacity: 1;
  transform: translateX(0);
}

.site-footer__live li {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-mute);
}
.site-footer__chip {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--text-soft);
}
.site-footer__chip--avail {
  background: var(--available);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--available) 25%, transparent);
  animation: foot-pulse 2s ease-in-out infinite;
}
@keyframes foot-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Bottom */
.site-footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: var(--text-soft);
}
.site-footer__credit {
  margin: 0;
}

.site-footer__easter {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  color: var(--text-soft);
  text-decoration: none;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  transition: color 200ms;
}
.site-footer__easter:hover {
  color: var(--accent);
}
.site-footer__easter-cursor {
  display: inline-block;
  width: 7px;
  height: 0.9em;
  background: currentColor;
  margin-left: 0.25rem;
  animation: blink 1.2s steps(1) infinite;
}
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
