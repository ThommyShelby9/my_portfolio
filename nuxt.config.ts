// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-04-01',
  devtools: { enabled: true },

  // Exclude the archived legacy SPA from Nuxt's typecheck and bundling.
  // It is preserved verbatim under legacy/terminal-spa/ for reintegration
  // as a client-only easter egg in Plan 4 (with its own dependency tree
  // copied into components/terminal/_legacy/ at that point).
  ignore: ['legacy/**', 'OLD_FILES/**'],

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-security',
    '@tresjs/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  typescript: {
    strict: true,
    typeCheck: false, // turned on by `pnpm typecheck`
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  runtimeConfig: {
    // Server-only secrets (filled by env vars at runtime)
    mongodbUri: process.env.MONGODB_URI || '',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || '',
    notificationEmail: process.env.NOTIFICATION_EMAIL || '',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || '',

    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '',
      umamiWebsiteId: process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID || '',
      umamiScriptUrl: process.env.NUXT_PUBLIC_UMAMI_SCRIPT_URL || '',
    },
  },

  i18n: {
    defaultLocale: 'fr',
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    strategy: 'prefix_except_default',
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'fr',
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'Rostel Panoumassi',
    description: 'Lead Engineering — disponible pour deux missions par trimestre.',
    defaultLocale: 'fr',
  },

  sitemap: {
    exclude: ['/brief/confirmation', '/en/brief/confirmation'],
  },

  robots: {
    sitemap: '/sitemap.xml',
    groups: [
      {
        userAgent: ['*'],
        allow: ['/'],
        disallow: ['/api/'],
      },
    ],
  },

  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/contact': { prerender: true },
    '/work': { prerender: true },
    '/work/**': { prerender: true },
    '/en': { prerender: true },
    '/en/about': { prerender: true },
    '/en/contact': { prerender: true },
    '/en/work': { prerender: true },
    '/en/work/**': { prerender: true },

    '/brief': { prerender: false, headers: { 'Cache-Control': 'no-store' } },
    '/brief/confirmation': { prerender: false, headers: { 'Cache-Control': 'no-store' } },
    '/en/brief': { prerender: false, headers: { 'Cache-Control': 'no-store' } },
    '/en/brief/confirmation': { prerender: false, headers: { 'Cache-Control': 'no-store' } },

    '/api/**': { cors: false, headers: { 'Cache-Control': 'no-store' } },
  },

  nitro: {
    prerender: {
      // Don't fail the build on transient image-pipeline (ipx) errors during
      // prerender — sharp binaries can be unavailable on some dev platforms
      // (e.g. win32-x64). Production builds with sharp installed will still
      // prerender all linked routes.
      failOnError: false,
    },
  },

  fonts: {
    families: [
      { name: 'Fraunces', provider: 'google', weights: [400, 500, 600], styles: ['normal', 'italic'] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] },
    ],
  },
})
