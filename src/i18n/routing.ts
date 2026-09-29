import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
  // Shared links must stay stable: never redirect "/" based on the browser language.
  localeDetection: false,
  // The site promises no cookies: do not let next-intl set NEXT_LOCALE.
  localeCookie: false,
  pathnames: {
    '/': '/',
    '/realisations': { fr: '/realisations', en: '/work' },
    '/realisations/[slug]': { fr: '/realisations/[slug]', en: '/work/[slug]' },
    '/explorations': '/explorations',
    '/a-propos': { fr: '/a-propos', en: '/about' },
    '/brief': '/brief',
    '/contact': '/contact',
    '/cv': '/cv',
    '/confidentialite': { fr: '/confidentialite', en: '/privacy' },
    '/cgu': { fr: '/cgu', en: '/terms' },
  },
});

export type Locale = (typeof routing.locales)[number];
