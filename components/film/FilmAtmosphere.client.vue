<script setup lang="ts">
const dust = ref<HTMLElement | null>(null)
onMounted(() => {
  // A handful of slow-drifting dust motes, generated so we don't hand-write 14 spans.
  if (!dust.value) return
  const seed = [7, 19, 31, 43, 55, 67, 4, 16, 28, 52, 64, 76, 88, 38]
  for (let i = 0; i < 14; i++) {
    const m = document.createElement('span')
    m.className = 'film-mote'
    m.style.left = `${(seed[i] * 1.3) % 100}%`
    m.style.top = `${18 + ((seed[i] * 2.1) % 72)}%`
    m.style.animationDelay = `${-(seed[i] % 26)}s`
    m.style.animationDuration = `${22 + (seed[i] % 18)}s`
    dust.value.appendChild(m)
  }
})
</script>

<template>
  <div class="film" aria-hidden="true">
    <div ref="dust" class="film-atmos">
      <div class="film-haze" />
    </div>
    <div class="film-bar film-bar--top" />
    <div class="film-bar film-bar--bot" />
    <div class="film-vignette" />
    <div class="film-grain" />
    <div class="film-flicker" />
  </div>
</template>

<style scoped>
.film { position: fixed; inset: 0; z-index: 0; pointer-events: none; }

/* ambient light + dust (behind content) */
.film-atmos { position: absolute; inset: 0; overflow: hidden; }
.film-haze {
  position: absolute; left: 50%; bottom: -40vh; width: 150vw; height: 120vh;
  transform: translateX(-50%); border-radius: 50%; filter: blur(80px);
  background: radial-gradient(circle at 50% 50%, rgba(232,178,90,.12), rgba(232,120,60,.04) 40%, transparent 66%);
  animation: film-swell 30s ease-in-out infinite;
}
@keyframes film-swell {
  0%, 100% { transform: translateX(-50%) translateY(0) scale(1); opacity: .8; }
  50% { transform: translateX(-50%) translateY(-4vh) scale(1.06); opacity: 1; }
}
:deep(.film-mote) {
  position: absolute; width: 2px; height: 2px; border-radius: 50%;
  background: #f3efe6; opacity: 0; filter: blur(.3px); animation: film-float 26s linear infinite;
}
@keyframes film-float {
  0% { transform: translateY(40px); opacity: 0; }
  14% { opacity: .5; } 86% { opacity: .4; }
  100% { transform: translateY(-140px) translateX(28px); opacity: 0; }
}

/* film frame (over content, faint) */
.film-bar { position: fixed; left: 0; right: 0; height: 26px; background: #000; }
.film-bar--top { top: 0; border-bottom: 1px solid var(--border); }
.film-bar--bot { bottom: 0; border-top: 1px solid var(--border); }
.film-vignette {
  position: fixed; inset: 0;
  background: radial-gradient(130% 95% at 50% 42%, transparent 48%, #000000e6 100%);
  animation: film-breathe 16s ease-in-out infinite;
}
@keyframes film-breathe { 0%, 100% { opacity: .92; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
.film-grain {
  position: fixed; inset: -50%; width: 200%; height: 200%; opacity: var(--grain-opacity); mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: film-grain .8s steps(4) infinite;
}
@keyframes film-grain { 0%{transform:translate(0,0)} 25%{transform:translate(-6%,4%)} 50%{transform:translate(4%,-5%)} 75%{transform:translate(-3%,3%)} 100%{transform:translate(2%,-2%)} }
.film-flicker { position: fixed; inset: 0; background: #000; opacity: 0; animation: film-flick 7s steps(1) infinite; }
@keyframes film-flick { 0%,7%,9%,60%,62%,100%{opacity:0} 8%{opacity:.045} 61%{opacity:.06} 85%{opacity:0} 86%{opacity:.035} 87%{opacity:0} }

@media (prefers-reduced-motion: reduce) {
  .film-haze, .film-vignette, .film-grain, .film-flicker { animation: none; }
  :deep(.film-mote) { animation: none; opacity: .3; }
}
</style>
