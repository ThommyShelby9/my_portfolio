<template>
  <div class="gz" aria-hidden="true">
    <div class="gz-stars" />
    <div class="gz-bloom" />
    <div class="gz-disk" />
    <div class="gz-sphere" />
    <div class="gz-ring" />
    <div class="gz-disk-front" />
    <div class="gz-hot" />
  </div>
</template>

<style scoped>
.gz {
  position: absolute; left: 50%; top: 44%; transform: translate(-50%, -50%);
  --d: clamp(300px, 64vh, 660px); width: var(--d); height: var(--d);
  pointer-events: none; transition: filter 2.4s ease;
}
/* warm→cold hook for later scenes */
:global(body.is-cold) .gz { filter: hue-rotate(178deg) saturate(.72) brightness(.82); }

.gz-stars {
  position: absolute; inset: -120%; border-radius: 50%;
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,.6), transparent),
    radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,.4), transparent),
    radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,.5), transparent),
    radial-gradient(1px 1px at 85% 25%, rgba(255,255,255,.35), transparent),
    radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,.45), transparent);
  opacity: .5;
}
.gz-bloom {
  position: absolute; inset: -70%; border-radius: 50%; filter: blur(56px);
  background: radial-gradient(circle, rgba(240,180,110,.24), rgba(230,120,60,.07) 40%, transparent 62%);
  animation: gz-breath 16s ease-in-out infinite;
}
@keyframes gz-breath { 0%,100%{ opacity:.85; transform:scale(1) } 50%{ opacity:1; transform:scale(1.06) } }
.gz-disk {
  position: absolute; left: -70%; right: -70%; top: 50%; height: 20%; transform: translateY(-50%); filter: blur(4px);
  background: radial-gradient(ellipse 46% 60% at 50% 50%, #fff, rgba(255,235,200,.95) 20%, rgba(250,170,90,.7) 42%, rgba(230,110,55,.2) 60%, transparent 74%);
}
.gz-sphere {
  position: absolute; inset: 0; border-radius: 50%; z-index: 2;
  background: radial-gradient(circle at 50% 50%, rgba(120,100,84,.16), rgba(20,16,14,.92) 46%, #000 66%);
  box-shadow: inset 0 0 60px #000;
}
.gz-ring {
  position: absolute; inset: -9%; border-radius: 50%; z-index: 3;
  filter: blur(2px) drop-shadow(0 0 26px rgba(255,190,120,.6));
  background: radial-gradient(circle, transparent 44%, rgba(255,236,205,.95) 49%, rgba(255,196,132,.55) 54%, rgba(255,150,90,.12) 60%, transparent 66%);
  animation: gz-spin 60s linear infinite;
}
@keyframes gz-spin { to { transform: rotate(360deg); } }
.gz-disk-front {
  position: absolute; left: -70%; right: -70%; top: 50%; height: 20%; transform: translateY(-50%); z-index: 4; filter: blur(4px);
  background: radial-gradient(ellipse 46% 60% at 50% 50%, #fff, rgba(255,235,200,.9) 22%, rgba(250,170,90,.55) 42%, transparent 66%);
  clip-path: inset(50% 0 0 0);
}
.gz-hot {
  position: absolute; left: 63%; top: 50%; width: 15%; height: 15%; transform: translate(-50%,-50%); z-index: 5;
  border-radius: 50%; filter: blur(6px);
  background: radial-gradient(circle, #fff, rgba(255,240,210,.7) 40%, transparent 70%);
}
@media (prefers-reduced-motion: reduce) { .gz-bloom, .gz-ring { animation: none; } }
</style>
