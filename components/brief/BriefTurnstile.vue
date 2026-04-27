<script setup lang="ts">
const config = useRuntimeConfig()
const siteKey = config.public.turnstileSiteKey
const { locale } = useI18n()

const containerRef = ref<HTMLElement | null>(null)
const widgetId = ref<string | null>(null)

const emit = defineEmits<{ token: [string] }>()

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if ((window as any).turnstile) return Promise.resolve()
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[data-turnstile]')) {
      const wait = setInterval(() => {
        if ((window as any).turnstile) { clearInterval(wait); resolve() }
      }, 50)
      return
    }
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.defer = true
    s.async = true
    s.dataset.turnstile = '1'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Turnstile'))
    document.head.appendChild(s)
  })
}

onMounted(async () => {
  if (!siteKey) {
    emit('token', 'local-dev')
    return
  }
  try {
    await loadScript()
    if (!containerRef.value) return
    widgetId.value = (window as any).turnstile.render(containerRef.value, {
      'sitekey': siteKey,
      'theme': 'auto',
      'language': locale.value,
      'callback': (token: string) => emit('token', token),
      'error-callback': () => emit('token', ''),
      'expired-callback': () => emit('token', ''),
    })
  }
  catch (err) {
    console.error('[turnstile widget]', err)
  }
})

onBeforeUnmount(() => {
  if (widgetId.value && (window as any).turnstile) {
    try { (window as any).turnstile.remove(widgetId.value) }
    catch { /* */ }
  }
})
</script>

<template>
  <div class="brief-turnstile">
    <div ref="containerRef" />
    <p v-if="!siteKey" class="brief-turnstile__dev">
      Dev mode — Turnstile désactivé (un token factice est envoyé).
    </p>
  </div>
</template>

<style scoped>
.brief-turnstile {
  margin: 1.5rem 0;
}

.brief-turnstile__dev {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  color: var(--text-soft);
  letter-spacing: 0.04em;
  margin: 0;
}
</style>
