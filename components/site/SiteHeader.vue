<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const cotonouTime = ref('')
let interval = 0

function updateTime() {
  const fmt = new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Africa/Porto-Novo',
    hour12: false,
  })
  cotonouTime.value = fmt.format(new Date())
}

const scroll = ref(0)
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  scroll.value = max > 0 ? Math.min(1, window.scrollY / max) : 0
}

const navOpen = ref(false)
function closeNav() { navOpen.value = false }

onMounted(() => {
  updateTime()
  interval = window.setInterval(updateTime, 1000)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  clearInterval(interval)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header class="site-header" :class="{ 'is-open': navOpen }">
    <div class="site-header__inner">
      <NuxtLink :to="localePath('/')" class="brand" @click="closeNav">
        <span class="brand__index">[01]</span>
        <span class="brand__name">Rostel <em>Panoumassi</em></span>
      </NuxtLink>

      <nav class="primary" aria-label="Primary">
        <NuxtLink :to="localePath('/work')" class="primary__link" @click="closeNav">
          <span class="primary__num">02</span>
          <span class="primary__text">{{ t('nav.work') }}</span>
        </NuxtLink>
        <NuxtLink :to="localePath('/about')" class="primary__link" @click="closeNav">
          <span class="primary__num">03</span>
          <span class="primary__text">{{ t('nav.about') }}</span>
        </NuxtLink>
        <NuxtLink :to="localePath('/contact')" class="primary__link" @click="closeNav">
          <span class="primary__num">04</span>
          <span class="primary__text">{{ t('nav.contact') }}</span>
        </NuxtLink>
      </nav>

      <div class="hud" aria-hidden="true">
        <span class="hud__dot" />
        <span class="hud__txt">{{ cotonouTime }} · COTONOU</span>
      </div>

      <div class="actions">
        <LangToggle />
        <ThemeToggle />
        <NuxtLink :to="localePath('/brief')" class="cta-pill" @click="closeNav">
          <span class="cta-pill__inner">
            <span>{{ t('nav.brief') }}</span>
            <span class="cta-pill__arrow">→</span>
          </span>
        </NuxtLink>
      </div>

      <button
        class="burger"
        :aria-expanded="navOpen"
        :aria-label="navOpen ? 'Close menu' : 'Open menu'"
        @click="navOpen = !navOpen"
      >
        <span /><span /><span />
      </button>
    </div>

    <div class="progress" :style="{ '--p': scroll }" aria-hidden="true" />

    <Transition name="curtain">
      <div v-if="navOpen" class="curtain">
        <nav class="curtain__nav" aria-label="Mobile">
          <NuxtLink :to="localePath('/work')" @click="closeNav">{{ t('nav.work') }}</NuxtLink>
          <NuxtLink :to="localePath('/about')" @click="closeNav">{{ t('nav.about') }}</NuxtLink>
          <NuxtLink :to="localePath('/contact')" @click="closeNav">{{ t('nav.contact') }}</NuxtLink>
          <NuxtLink :to="localePath('/brief')" @click="closeNav">{{ t('nav.brief') }}</NuxtLink>
        </nav>
        <p class="curtain__time">{{ cotonouTime }} · COTONOU, BJ</p>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in oklab, var(--bg) 88%, transparent);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border-bottom: 1px solid var(--border);
}

.site-header__inner {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.1rem 1.5rem;
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .site-header__inner {
    grid-template-columns: 1fr auto;
    gap: 1rem;
  }
  .primary, .hud { display: none; }
}

/* Brand */
.brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--text);
}
.brand__index {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  color: var(--text-soft);
}
.brand__name {
  font-family: theme('fontFamily.display');
  font-size: 1.0625rem;
  letter-spacing: -0.005em;
}
.brand__name em {
  font-family: theme('fontFamily.editorial');
  color: var(--text-mute);
}

/* Primary nav */
.primary {
  display: flex;
  align-items: center;
  gap: 2.25rem;
  justify-self: start;
  margin-left: 2rem;
}
.primary__link {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  font-family: theme('fontFamily.body');
  font-size: 0.9375rem;
  color: var(--text-mute);
  text-decoration: none;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid transparent;
  transition: color 200ms, border-color 200ms;
}
.primary__num {
  font-family: theme('fontFamily.mono');
  font-size: 0.625rem;
  color: var(--text-soft);
  letter-spacing: 0.08em;
}
.primary__link:hover, .primary__link.router-link-active {
  color: var(--text);
  border-bottom-color: var(--accent);
}

/* HUD */
.hud {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: var(--text-soft);
}
.hud__dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: var(--available);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--available) 25%, transparent);
  animation: hud-pulse 2.4s ease-in-out infinite;
}
@keyframes hud-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.6; }
}

/* Actions */
.actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.cta-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--bg);
  background: var(--text);
  padding: 0.7rem 1.1rem;
  border-radius: 999px;
  overflow: hidden;
  transition: color 250ms;
}
.cta-pill::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  transform: translateY(100%);
  transition: transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;
}
.cta-pill:hover { color: var(--accent-ink); }
.cta-pill:hover::before { transform: translateY(0); }
.cta-pill__inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.cta-pill__arrow {
  transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
}
.cta-pill:hover .cta-pill__arrow {
  transform: translateX(3px);
}

@media (max-width: 1024px) {
  .actions { display: none; }
}

/* Burger */
.burger {
  display: none;
  position: relative;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  cursor: pointer;
}
.burger span {
  position: absolute;
  left: 9px;
  right: 9px;
  height: 1px;
  background: var(--text);
  transition: transform 300ms, opacity 200ms;
}
.burger span:nth-child(1) { top: 13px; }
.burger span:nth-child(2) { top: 17.5px; }
.burger span:nth-child(3) { top: 22px; }
.site-header.is-open .burger span:nth-child(1) { transform: translateY(4.5px) rotate(45deg); }
.site-header.is-open .burger span:nth-child(2) { opacity: 0; }
.site-header.is-open .burger span:nth-child(3) { transform: translateY(-4.5px) rotate(-45deg); }

@media (max-width: 1024px) {
  .burger { display: inline-flex; align-items: center; justify-content: center; }
}

/* Progress bar at bottom of header */
.progress {
  height: 1px;
  width: 100%;
  background: transparent;
  position: relative;
}
.progress::after {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: calc(var(--p, 0) * 100%);
  background: var(--accent);
  transition: width 80ms linear;
}

/* Mobile curtain */
.curtain {
  position: fixed;
  inset: 64px 0 0 0;
  background: var(--bg);
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 49;
}
.curtain__nav {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.curtain__nav a {
  font-family: theme('fontFamily.display');
  font-size: clamp(2rem, 8vw, 4rem);
  color: var(--text);
  text-decoration: none;
  line-height: 1;
  position: relative;
}
.curtain__nav a:hover, .curtain__nav a.router-link-active {
  color: var(--accent);
  font-style: italic;
}
.curtain__time {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-soft);
  letter-spacing: 0.1em;
}

.curtain-enter-active, .curtain-leave-active {
  transition: opacity 250ms, transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
}
.curtain-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.curtain-leave-to {
  opacity: 0;
}
</style>
