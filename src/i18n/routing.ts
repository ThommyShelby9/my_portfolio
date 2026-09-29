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
    '/explorations/[slug]': '/explorations/[slug]',
    '/a-propos': { fr: '/a-propos', en: '/about' },
    '/brief': '/brief',
    '/brief/merci': { fr: '/brief/merci', en: '/brief/thanks' },
    '/contact': '/contact',
    '/contact/merci': { fr: '/contact/merci', en: '/contact/thanks' },
    '/cv': '/cv',
    '/confidentialite': { fr: '/confidentialite', en: '/privacy' },
    '/cgu': { fr: '/cgu', en: '/terms' },
  },
});

export type Locale = (typeof routing.locales)[number];
