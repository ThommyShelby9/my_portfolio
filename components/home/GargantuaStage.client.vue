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
  display: grid;
  place-items: center;
  /* recede as the reel ends (set by useManifesto on :root) */
  transform: scale(calc(1 - var(--void-recede, 0) * 0.22));
  opacity: calc(1 - var(--void-recede, 0) * 0.7);
  transition: opacity 0.4s linear;
}
/* Gargantua sizes itself; keep it centered in the fixed layer rather than the hero. */
.gz-stage :deep(.gz) { position: relative; left: auto; top: auto; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .gz-stage { transform: none; opacity: 0.85; }
}
</style>
