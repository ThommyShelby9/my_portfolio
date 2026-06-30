<script setup lang="ts">
import { buildBodies } from '~/space/bodies'
import type { CaseStudyLike } from '~/space/bodies'
import { resolveQuality } from '~/space/quality'
import type { OrreryHandle } from '~/space/orrery'

const props = defineProps<{ studies: CaseStudyLike[] }>()

const { supported, lowPerf } = useWebGLCapability()
const { reduce } = useReducedMotion()
const space = useSpaceStore()
const router = useRouter()
const localePath = useLocalePath()
const { locale } = useI18n()

const stage = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

// Reactive hover state — we store the full study object for the label
const hovered = ref<CaseStudyLike | null>(null)

let handle: OrreryHandle | null = null
let onVisibility: (() => void) | null = null
let ro: ResizeObserver | null = null
let unmounted = false

onMounted(async () => {
  const quality = resolveQuality({
    supported: supported.value,
    lowPerf: lowPerf.value,
    reduce: reduce.value,
  })

  if (!quality.enabled || !canvas.value) return

  const { createOrrery } = await import('~/space/orrery')

  // Guard: component may have been unmounted during the async import
  if (unmounted) return

  const bodies = buildBodies(props.studies)

  handle = await createOrrery(canvas.value, bodies, {
    maxDpr: quality.maxDpr,
    onHover(slug) {
      hovered.value = slug ? (props.studies.find((s) => s.slug === slug) ?? null) : null
    },
    onSelect(slug) {
      router.push(localePath('/work/' + slug))
    },
  })

  // Guard: component may have been unmounted while createOrrery was initialising
  if (unmounted) {
    handle.destroy()
    handle = null
    return
  }

  space.setMode('orrery')

  ro = new ResizeObserver(() => handle?.resize())
  if (stage.value) ro.observe(stage.value)

  onVisibility = () => handle?.setPaused(document.hidden)
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  unmounted = true
  if (onVisibility) {
    document.removeEventListener('visibilitychange', onVisibility)
    onVisibility = null
  }
  ro?.disconnect()
  ro = null
  handle?.destroy()
  handle = null
  space.setMode('ambient')
})
</script>

<template>
  <div ref="stage" class="orrery" aria-hidden="true">
    <canvas ref="canvas" class="orrery__canvas" aria-hidden="true" style="pointer-events: auto" />

    <!-- Hover label overlay — decorative, accessible content is the DOM list -->
    <div v-if="hovered" class="orrery__label" aria-hidden="true">
      <p class="orrery__label-title">{{ hovered.title ?? hovered.slug }}</p>
      <p v-if="hovered.results?.[0]" class="orrery__label-result">
        <span class="orrery__label-value">{{ hovered.results[0].value }}</span>
        <span class="orrery__label-meta">— {{ hovered.results[0].label }}</span>
      </p>
    </div>

    <!-- Affordance hint -->
    <p class="orrery__hint" aria-hidden="true">
      {{ locale === 'fr' ? 'Survole · clique' : 'Hover · click' }}
    </p>
  </div>
</template>

<style scoped>
.orrery {
  position: relative;
  height: clamp(420px, 70vh, 760px);
  width: 100%;
}

.orrery__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

/* Hover label — bottom-left of the stage */
.orrery__label {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  background: var(--bg-overlay);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.875rem 1.125rem;
  pointer-events: none;
  /* Stacks above canvas */
  z-index: 2;
  max-width: 22rem;
}

.orrery__label-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: var(--text);
  margin: 0;
  line-height: 1.25;
}

.orrery__label-result {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  margin: 0.5rem 0 0;
  font-family: 'Poppins', sans-serif;
  font-size: 0.8125rem;
}

.orrery__label-value {
  font-weight: 700;
  font-size: 1.1875rem;
  color: var(--accent);
  letter-spacing: -0.01em;
}

.orrery__label-meta {
  color: var(--text-mute);
  font-weight: 400;
}

/* Affordance hint — top-right corner */
.orrery__hint {
  position: absolute;
  top: 1.25rem;
  right: 1.5rem;
  font-family: 'Poppins', sans-serif;
  font-size: 0.6875rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  margin: 0;
  pointer-events: none;
  z-index: 2;
  text-transform: uppercase;
}
</style>
