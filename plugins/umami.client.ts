export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const websiteId = config.public.umamiWebsiteId
  const scriptUrl = config.public.umamiScriptUrl

  if (!websiteId || !scriptUrl) return

  useHead({
    script: [
      {
        src: scriptUrl,
        async: true,
        defer: true,
        'data-website-id': websiteId,
        'data-do-not-track': 'true',
        'data-cache': 'true',
      },
    ],
  })
})
