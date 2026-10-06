import { useTranslations } from 'next-intl';
import type { ComponentProps } from 'react';
import { Link } from '@/i18n/navigation';
import { ButtonLink } from './ButtonLink';
import { LocaleSwitch } from './LocaleSwitch';
import { MobileMenu } from './MobileMenu';
import { Monogram } from './Monogram';

export type NavItem = { href: ComponentProps<typeof Link>['href']; label: string };

export function Header() {
  const t = useTranslations('nav');
  const items: NavItem[] = [
    { href: '/realisations', label: t('work') },
    { href: { pathname: '/', hash: 'expertise' }, label: t('expertise') },
    { href: '/a-propos', label: t('about') },
    { href: '/explorations', label: t('explorations') },
  ];
  return (
    <header className="sticky top-0 z-30 bg-graphite/85 backdrop-blur-md">
      <div className="relative mx-auto flex min-h-(--header-h) max-w-[1280px] items-center gap-3 px-5 md:gap-10 md:px-10">
        <Link href="/" aria-label={t('home')} className="text-ivory no-underline">
          <Monogram />
        </Link>
        <nav aria-label={t('label')} className="ml-auto hidden md:block">
          <ul className="flex gap-8 font-mono text-[11.5px] uppercase tracking-[0.14em] text-muted">
            {items.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="no-underline transition-colors hover:text-ivory">{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-3 md:ml-0 md:gap-5">
          <MobileMenu items={items} label={t('label')} menuLabel={t('menu')} closeLabel={t('closeMenu')} />
          <LocaleSwitch label={t('switchLocale')} />
          <ButtonLink href="/brief" variant="primary" className="max-md:px-3.5">{t('cta')}</ButtonLink>
        </div>
      </div>
    </header>
  );
}
