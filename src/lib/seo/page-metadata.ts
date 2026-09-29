import type { Metadata } from 'next';
import type { routing, Locale } from '@/i18n/routing';
import { localizedPath } from '@/lib/i18n/localized-path';

import { SITE_URL } from '@/lib/site';

type Args = {
  locale: Locale;
  href: keyof typeof routing.pathnames;
  params?: Record<string, string>;
  title: string;
  description: string;
};

export function pageMetadata({ locale, href, params, title, description }: Args): Metadata {
  const abs = (l: Locale) => new URL(localizedPath(href, l, params), SITE_URL).toString();
  return {
    title,
    description,
    alternates: {
      canonical: abs(locale),
      languages: { fr: abs('fr'), en: abs('en'), 'x-default': abs('fr') },
    },
  };
}
