<script setup lang="ts">
const { resolved } = useTheme()
const { locale } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

// hreflang alternates for FR ↔ EN, auto-managed by @nuxtjs/i18n.
// In v9+ the SEO attributes (lang, dir, hreflang links, og:locale meta) are
// returned by default — no options needed.
const i18nHead = useLocaleHead()

// Site URL — production: https://rostelmissimawu.com, fallback to env override.
const siteUrl = computed(() => (config.public.siteUrl as string).replace(/\/$/, ''))

// Theme color follows the resolved theme so iOS/Android UI chrome matches.
const themeColor = computed(() => resolved.value === 'light' ? '#f1e9d6' : '#0c0a08')

// Canonical URL — always the localised absolute URL of the current route.
const canonical = computed(() => `${siteUrl.value}${route.path}`.replace(/\/$/, '') || siteUrl.value)

// Structured data — Person + WebSite. Helps Google build a rich result and
// link the brand together across SERPs.
const personSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  'name': 'Rostel Panoumassi',
  'alternateName': 'Rostel Missimawu',
  'jobTitle': locale.value === 'en' ? 'Head of Engineering & Innovation' : 'Lead Engineering & Innovation',
  'worksFor': {
    '@type': 'Organization',
    'name': 'KPS Groupe',
  },
  'address': {
    '@type': 'PostalAddress',
    'addressLocality': 'Cotonou',
    'addressRegion': 'Littoral',
    'addressCountry': 'BJ',
  },
  'url': siteUrl.value,
  'image': `${siteUrl.value}/images/profile.jpg`,
  'email': 'mailto:rmissimawu@gmail.com',
  'sameAs': [
    'https://www.linkedin.com/in/rostelpanoumassi-6b6608335',
    'https://github.com/ThommyShelby9',
  ],
  'knowsAbout': [
    'Software Architecture',
    'Backend Engineering',
    'Distributed Systems',
    'Django',
    'Spring Boot',
    'Vue.js',
    'Node.js',
    'Kubernetes',
    'PostgreSQL',
    'MongoDB',
  ],
}))

const websiteSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': 'Rostel Panoumassi',
  'url': siteUrl.value,
  'inLanguage': [locale.value === 'en' ? 'en-US' : 'fr-FR'],
  'author': {
    '@type': 'Person',
    'name': 'Rostel Panoumassi',
  },
}))

useHead({
  htmlAttrs: {
    'data-theme': resolved,
    'lang': computed(() => (i18nHead.value?.htmlAttrs as any)?.lang ?? locale.value),
    'dir': computed(() => (i18nHead.value?.htmlAttrs as any)?.dir ?? 'ltr'),
  } as any,
  link: () => [
    // Favicons
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'shortcut icon', href: '/favicon.ico' },
    { rel: 'manifest', href: '/site.webmanifest' },
    // Canonical — per-route absolute URL.
    { rel: 'canonical', href: canonical.value },
    // hreflang alternates injected by @nuxtjs/i18n.
    ...(i18nHead.value?.link ?? []),
  ],
  meta: () => [
    { name: 'theme-color', content: themeColor.value },
    { name: 'apple-mobile-web-app-title', content: 'Rostel' },
    { name: 'application-name', content: 'Rostel Panoumassi' },
    { name: 'author', content: 'Rostel Panoumassi' },
    // og:locale alternates injected by @nuxtjs/i18n.
    ...(i18nHead.value?.meta ?? []),
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify(personSchema.value),
    },
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify(websiteSchema.value),
    },
  ],
})

useSeoMeta({
  ogImage: () => `${siteUrl.value}/og-default.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Rostel Panoumassi — Lead Engineering',
  ogSiteName: 'Rostel Panoumassi',
  ogLocale: () => locale.value === 'en' ? 'en_US' : 'fr_FR',
  ogLocaleAlternate: () => locale.value === 'en' ? ['fr_FR'] : ['en_US'],
  twitterCard: 'summary_large_image',
  twitterCreator: '@rostelpanoumassi',
  twitterSite: '@rostelpanoumassi',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage
      :transition="{
        name: 'page',
        mode: 'out-in',
        appear: true,
      }"
    />
  </NuxtLayout>
</template>

<style>
/* Global page transition — slide up + clip-path reveal.
   Out-going: slight lift + fade.
   In-coming: rises from bottom with a clip-path mask. */
.page-enter-active,
.page-leave-active {
  will-change: transform, opacity, clip-path;
}
.page-enter-active {
  transition:
    transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 500ms cubic-bezier(0.22, 1, 0.36, 1),
    clip-path 700ms cubic-bezier(0.22, 1, 0.36, 1);
}
.page-leave-active {
  transition:
    transform 350ms cubic-bezier(0.5, 0, 0.75, 0),
    opacity 280ms ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(28px);
  clip-path: inset(8% 0 0 0);
}
.page-enter-to {
  opacity: 1;
  transform: translateY(0);
  clip-path: inset(0 0 0 0);
}
.page-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.995);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: opacity 120ms linear !important;
  }
  .page-enter-from,
  .page-leave-to {
    transform: none;
    clip-path: none;
  }
}
</style>
