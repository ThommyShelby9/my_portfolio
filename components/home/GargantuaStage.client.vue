<template>
  <div class="gz-stage" aria-hidden="true">
    <Gargantua />
  </div>
</template>

<style scoped>
.gz-stage {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  /* recede as the reel ends (set by useManifesto on :root) */
  transform: scale(calc(1 - var(--void-recede, 0) * 0.22));
  opacity: calc(1 - var(--void-recede, 0) * 0.7);
  transition: opacity 0.4s linear;
}
/* smaller + higher hole so text reads in the clear lower band (matches --hole-y: 33%) */
.gz-stage :deep(.gz) {
  position: absolute;
  left: 50%;
  top: 33%;
  transform: translate(-50%, -50%);
  --d: min(44vh, 86vw);
}
@media (prefers-reduced-motion: reduce) {
  .gz-stage { transform: none; opacity: 0.85; }
}
</style>
