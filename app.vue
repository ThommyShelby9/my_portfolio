<script setup lang="ts">
const { resolved } = useTheme()

useHead({
  htmlAttrs: {
    'data-theme': resolved,
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
