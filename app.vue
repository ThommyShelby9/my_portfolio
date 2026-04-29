<script setup lang="ts">
const { resolved } = useTheme()

useHead({
  htmlAttrs: {
    'data-theme': resolved,
  },
})

const config = useRuntimeConfig()
useSeoMeta({
  ogImage: () => `${config.public.siteUrl}/og-default.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Rostel Panoumassi — Lead Engineering',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
