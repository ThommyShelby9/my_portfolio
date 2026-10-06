import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { OWNER } from '@/lib/site';

const item = 'no-underline transition-colors hover:text-ivory';

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="relative z-10 border-t border-line bg-graphite py-9 font-mono text-[11.5px] uppercase tracking-[0.12em] text-faint">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 md:px-10">
        <div className="flex flex-wrap gap-x-7 gap-y-3">
          <span>Rostel Panoumassi · Cotonou</span>
          <a href={`mailto:${OWNER.email}`} className={`${item} normal-case tracking-[0.04em]`}>{OWNER.email}</a>
          <a href={OWNER.linkedin} rel="me noopener" className={item}>LinkedIn</a>
          <a href={OWNER.github} rel="me noopener" className={item}>GitHub</a>
        </div>
        <div className="flex flex-wrap gap-x-7 gap-y-3">
          <Link href="/confidentialite" className={item}>{t('privacy')}</Link>
          <Link href="/cgu" className={item}>{t('terms')}</Link>
          <span>{t('built')}</span>
        </div>
      </div>
    </footer>
  );
}
