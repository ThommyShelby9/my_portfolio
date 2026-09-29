import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ButtonLink } from './ButtonLink';
import { LocaleSwitch } from './LocaleSwitch';
import { Monogram } from './Monogram';

export function Header() {
  const t = useTranslations('nav');
  const items = [
    { href: '/realisations', label: t('work') },
    { href: '/realisations', label: t('expertise') },
    { href: '/a-propos', label: t('about') },
    { href: '/explorations', label: t('explorations') },
  ] as const;
  return (
    <header className="sticky top-0 z-30 bg-linear-to-b from-obsidian to-obsidian/0">
      <div className="mx-auto flex min-h-(--header-h) max-w-[1280px] items-center gap-6 px-5 md:gap-10 md:px-10">
        <Link href="/" aria-label={t('home')} className="text-ivory no-underline">
          <Monogram />
        </Link>
        <nav aria-label={t('label')} className="ml-auto hidden md:block">
          <ul className="flex gap-8 text-[13.5px] text-muted">
            {items.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="no-underline hover:text-ivory">{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-5 md:ml-0">
          <LocaleSwitch />
          <ButtonLink href="/brief" variant="primary">{t('cta')}</ButtonLink>
        </div>
      </div>
    </header>
  );
}
