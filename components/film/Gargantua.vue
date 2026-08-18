<template>
  <div class="gz" aria-hidden="true">
    <div class="gz-stars" />
    <div class="gz-bloom" />
    <div class="gz-flare" />
    <div class="gz-disk" />
    <div class="gz-halo" />
    <div class="gz-stream gz-stream--out" />
    <div class="gz-sphere" />
    <div class="gz-stream gz-stream--in" />
    <div class="gz-photon" />
    <div class="gz-diskf" />
    <div class="gz-hot" />
    <div class="gz-flash" />
  </div>
</template>

<style scoped>
.gz {
  position: absolute; left: 50%; top: 44%; transform: translate(-50%, -50%);
  --d: clamp(300px, 64vh, 660px); width: var(--d); height: var(--d);
  pointer-events: none; transition: filter 2.4s ease;
}
.gz > * { position: absolute; border-radius: 50%; }

/* warm→cold hook for later scenes */
:global(body.is-cold) .gz { filter: hue-rotate(178deg) saturate(.72) brightness(.82); }

.gz-stars {
  inset: -120%;
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,.6), transparent),
    radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,.4), transparent),
    radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,.5), transparent),
    radial-gradient(1px 1px at 85% 25%, rgba(255,255,255,.35), transparent),
    radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,.45), transparent);
  opacity: .5;
}

.gz-bloom {
  inset: -62%; filter: blur(54px);
  background: radial-gradient(circle, rgba(255,192,122,.26), rgba(236,120,55,.09) 42%, transparent 60%);
  transform: scale(calc(1 + var(--feed, 0) * 0.16));
  opacity: calc(.9 + var(--feed, 0) * 0.6);
  animation: gz-bloom-in 1.2s ease .5s both, gz-breath 15s ease-in-out 1.9s infinite;
}
@keyframes gz-breath { 0%,100%{ opacity:.85; transform:scale(1) } 50%{ opacity:1; transform:scale(1.05) } }

/* ingestion flare — flashes when a section crosses the horizon */
.gz-flare {
  inset: -16%; z-index: 2; pointer-events: none;
  opacity: calc(var(--feed, 0) * .9); filter: blur(10px);
  background: radial-gradient(circle, rgba(255,236,205,.5) 40%, rgba(255,180,110,.18) 55%, transparent 66%);
}

/* equatorial disk behind the shadow, Doppler-biased brighter to the left */
.gz-disk {
  left: -74%; right: -74%; top: 50%; height: 22%; border-radius: 0;
  transform: translateY(-50%); filter: blur(4px);
  background: radial-gradient(ellipse 48% 62% at 40% 50%,
    #fff, rgba(255,240,208,.98) 15%, rgba(255,182,96,.82) 40%, rgba(230,104,50,.3) 60%, transparent 77%);
  animation: gz-grow-x 1.1s cubic-bezier(.2,.7,.2,1) .2s both;
}

/* static thick Einstein halo — light lensed over/under */
.gz-halo {
  inset: -12%; z-index: 2;
  filter: blur(1.4px) drop-shadow(0 0 30px rgba(255,198,128,.78));
  background: radial-gradient(circle, transparent 42%, rgba(255,242,214,.98) 46.5%,
    rgba(255,202,142,.72) 52%, rgba(255,150,90,.22) 58%, transparent 64%);
  animation: gz-ring-in 1.0s ease .7s both;
}

/* orbiting light — two rings, differential rotation (inner faster = Keplerian) */
.gz-stream {
  z-index: 3; filter: blur(2px); mix-blend-mode: screen;
  background: conic-gradient(from 0deg,
    transparent 0 6%, rgba(255,232,198,.55) 18%, rgba(255,190,120,.14) 34%,
    transparent 46% 64%, rgba(255,224,186,.38) 80%, transparent 94%);
}
.gz-stream--out {
  inset: -12%; animation: gz-fade-in .8s ease 1.2s both, gz-spin 11s linear 1.2s infinite;
  -webkit-mask: radial-gradient(circle, transparent 45%, #000 48%, #000 58%, transparent 62%);
          mask: radial-gradient(circle, transparent 45%, #000 48%, #000 58%, transparent 62%);
}
.gz-stream--in {
  inset: -4%; z-index: 4; animation: gz-fade-in .8s ease 1.35s both, gz-spin 6.2s linear 1.35s infinite;
  -webkit-mask: radial-gradient(circle, transparent 43%, #000 46%, #000 53%, transparent 57%);
          mask: radial-gradient(circle, transparent 43%, #000 46%, #000 53%, transparent 57%);
}
@keyframes gz-spin { to { transform: rotate(360deg); } }

/* the shadow — deep, crisp */
.gz-sphere {
  inset: 0; z-index: 3;
  background: radial-gradient(circle at 50% 50%, rgba(58,46,38,.22), #050403 44%, #000 60%);
  box-shadow: inset 0 0 70px #000;
  animation: gz-sphere-in 1.0s cubic-bezier(.2,.7,.2,1) .9s both;
}

/* thin ultra-bright photon ring hugging the shadow edge; brightens when feeding */
.gz-photon {
  inset: -1%; z-index: 5;
  filter: blur(.5px) drop-shadow(0 0 calc(12px + var(--feed, 0) * 26px) rgba(255,222,172,.9));
  background: radial-gradient(circle, transparent 43%, rgba(255,249,234,.98) 45.4%,
    rgba(255,214,158,.6) 48%, transparent 51%);
  animation: gz-fade-in .7s ease 1.55s both;
}

/* near edge of the disk crossing in front at the bottom */
.gz-diskf {
  left: -74%; right: -74%; top: 50%; height: 22%; border-radius: 0;
  transform: translateY(-50%); z-index: 6; filter: blur(3.5px);
  background: radial-gradient(ellipse 48% 60% at 40% 50%,
    #fff, rgba(255,240,208,.95) 18%, rgba(255,182,96,.64) 40%, transparent 66%);
  clip-path: inset(50% 0 0 0);
  animation: gz-grow-x 1.1s cubic-bezier(.2,.7,.2,1) .45s both;
}

/* Doppler beaming peak — approaching side, hot & white, pushed left */
.gz-hot {
  left: 30%; top: 50%; width: 15%; height: 15%; z-index: 7;
  transform: translate(-50%, -50%); filter: blur(6px);
  background: radial-gradient(circle, #fff, rgba(255,246,222,.82) 40%, transparent 70%);
  animation: gz-fade-in .8s ease 1.2s both;
}

/* the birth flash — formation intro only, plays once on mount */
.gz-flash {
  inset: -40%; z-index: 8; pointer-events: none;
  background: radial-gradient(circle, rgba(255,248,230,.95), rgba(255,210,150,.5) 30%, transparent 60%);
  animation: gz-flash 1.1s ease-out .1s both;
}

@keyframes gz-grow-x {
  0% { transform: translateY(-50%) scaleX(0); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: translateY(-50%) scaleX(1); opacity: 1; }
}
@keyframes gz-ring-in {
  0% { transform: scale(1.55); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes gz-sphere-in {
  0% { transform: scale(.2); opacity: 0; }
  55% { opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes gz-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes gz-bloom-in { from { opacity: 0; } to { opacity: .9; } }
@keyframes gz-flash {
  0% { opacity: 0; }
  18% { opacity: .9; }
  100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .gz-bloom, .gz-disk, .gz-diskf, .gz-halo, .gz-sphere, .gz-photon, .gz-hot,
  .gz-stream--out, .gz-stream--in, .gz-flare { animation: none; }
  .gz-flash { display: none; }
}
</style>
