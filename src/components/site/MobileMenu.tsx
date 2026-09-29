'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, type MouseEvent } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import type { NavItem } from './Header';

export function MobileMenu({ items }: { items: readonly NavItem[] }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const details = useRef<HTMLDetailsElement>(null);

  // Close after a client-side navigation (a no-JS visitor gets a full page load anyway).
  useEffect(() => { if (details.current) details.current.open = false; }, [pathname]);

  const closeOnLink = (e: MouseEvent) => {
    if ((e.target as Element).closest('a')) details.current?.removeAttribute('open');
  };

  return (
    <details ref={details} data-mobile-menu className="group md:hidden">
      <summary className="flex cursor-pointer list-none items-center rounded-[2px] border border-[#3a3b3e] px-3 py-3 text-[13px] font-medium [&::-webkit-details-marker]:hidden">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" className="group-open:hidden" />
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" className="hidden group-open:block" />
        </svg>
        <span className="sr-only group-open:hidden">{t('menu')}</span>
        <span className="sr-only hidden group-open:inline">{t('closeMenu')}</span>
      </summary>
      <nav onClick={closeOnLink} aria-label={t('label')} className="absolute inset-x-0 top-full border-b border-line bg-obsidian px-5 pb-8 pt-4">
        <ul className="flex flex-col gap-1 text-lg">
          {items.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="block py-3 font-serif text-[26px] no-underline">{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
