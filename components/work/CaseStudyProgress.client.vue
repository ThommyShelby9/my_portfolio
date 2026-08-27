<script setup lang="ts">
// Filmic reading progress — a thin fixed amber bar under the header that
// fills left-to-right with article scroll position. rAF-throttled scroll
// listener; cleaned up on unmount.
const progress = ref(0)

let rafId = 0
let ticking = false

function measure() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
  ticking = false
}

function onScroll() {
  if (ticking) return
  ticking = true
  rafId = requestAnimationFrame(measure)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  measure()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <!-- Teleport to body so `position:fixed` is measured against the viewport,
       not the page-transition root (app.vue) which is transformed during route
       changes and would otherwise shift this bar off-screen mid-transition. -->
  <Teleport to="body">
    <div class="cs-progress" aria-hidden="true" :style="{ '--p': progress }" />
  </Teleport>
</template>

<style scoped>
.cs-progress {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 40;
  background: var(--accent);
  transform: scaleX(var(--p, 0));
  transform-origin: left;
  pointer-events: none;
  will-change: transform;
  transition: transform 100ms linear;
}

@media (prefers-reduced-motion: reduce) {
  .cs-progress {
    transition: none;
  }
}
</style>
