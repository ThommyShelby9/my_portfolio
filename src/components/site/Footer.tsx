import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="border-t border-line py-9 text-[13px] text-faint">
      <div className="mx-auto flex max-w-[1280px] flex-wrap gap-x-7 gap-y-3 px-5 md:px-10">
        <span>Rostel Panoumassi, Cotonou</span>
        <a href="mailto:rmissimawu@gmail.com" className="no-underline hover:text-ivory">rmissimawu@gmail.com</a>
        <a href="https://www.linkedin.com/in/rostelpanoumassi-6b6608335" rel="me noopener" className="no-underline hover:text-ivory">LinkedIn</a>
        <a href="https://github.com/ThommyShelby9" rel="me noopener" className="no-underline hover:text-ivory">GitHub</a>
        <span className="flex flex-wrap gap-x-5 gap-y-3 md:ml-auto">
          <Link href="/confidentialite" className="no-underline hover:text-ivory">{t('privacy')}</Link>
          <Link href="/cgu" className="no-underline hover:text-ivory">{t('terms')}</Link>
          <span>{t('built')}</span>
        </span>
      </div>
    </footer>
  );
}
