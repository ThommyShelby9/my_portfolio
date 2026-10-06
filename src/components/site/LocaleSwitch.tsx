'use client';

import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link, usePathname } from '@/i18n/navigation';

export function LocaleSwitch({ label }: { label: string }) {
  const locale = useLocale();
  const other = locale === 'fr' ? 'en' : 'fr';
  const pathname = usePathname();
  const params = useParams();
  return (
    <Link
      // next-intl types `href` per pathname; dynamic params come from the current route.
      // @ts-expect-error -- pathname and params always belong to the current, valid route
      href={{ pathname, params }}
      locale={other}
      hrefLang={other}
      lang={other}
      aria-label={label}
      className="font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-muted no-underline hover:text-ivory"
    >
      {other.toUpperCase()}
    </Link>
  );
}
