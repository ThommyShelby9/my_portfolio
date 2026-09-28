import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://rostelmissimawu.com',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    mdx(),
    sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', fr: 'fr' } } }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: { prefixDefaultLocale: false },
  },
});
