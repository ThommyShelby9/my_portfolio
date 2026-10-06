import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/forms/ContactForm';
import { formLabels } from '@/components/forms/shared-labels';
import { ButtonLink } from '@/components/site/ButtonLink';
import type { Locale } from '@/i18n/routing';
import { localizedPath } from '@/lib/i18n/localized-path';
import { pageMetadata } from '@/lib/seo/page-metadata';
import { OWNER } from '@/lib/site';

export async function generateMetadata({ params }: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'contact' });
  return pageMetadata({ locale: locale as Locale, href: '/contact', title: t('metaTitle'), description: t('metaDescription') });
}

const hero = (i: number) => ({ '--hero-i': i }) as CSSProperties;
const link = 'border-b border-edge pb-0.5 text-ivory no-underline transition-colors hover:border-signal hover:text-signal';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 border-t border-line py-5 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6">
      <dt className="pt-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-faint">{label}</dt>
      <dd className="text-[15.5px] leading-[1.6] text-ivory">{children}</dd>
    </div>
  );
}

export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, shared] = await Promise.all([getTranslations({ locale, namespace: 'contact' }), formLabels(locale)]);

  return (
    <section className="mx-auto grid max-w-[1280px] gap-x-24 gap-y-16 px-5 pb-[14vh] pt-[9vh] md:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:pt-[14vh]">
      <div>
        <p data-hero style={hero(0)} className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-signal">{t('kicker')}</p>
        <h1 data-hero style={hero(1)} className="mt-5 max-w-[12ch] font-display text-[clamp(42px,6vw,88px)] font-medium leading-[1.02] tracking-[-0.015em]">
          {t('title')}
        </h1>
        <p data-hero style={hero(2)} className="mt-8 max-w-[44ch] text-[16.5px] leading-[1.7] text-muted">{t('lede')}</p>
        <div data-hero style={hero(3)}>
          <h2 className="sr-only">{t('channels')}</h2>
          <dl className="mt-12 border-b border-line">
            <Row label={t('email')}>
              <a href={`mailto:${OWNER.email}`} className={link}>{OWNER.email}</a>
            </Row>
            <Row label={t('elsewhere')}>
              <span className="flex flex-wrap gap-x-6 gap-y-2">
                <a href={OWNER.linkedin} rel="me noopener" className={link}>LinkedIn</a>
                <a href={OWNER.github} rel="me noopener" className={link}>GitHub</a>
              </span>
            </Row>
            <Row label={t('location')}>{t('locationValue')}</Row>
          </dl>
          <div className="mt-12 flex flex-col items-start gap-5">
            <p className="max-w-[24ch] font-display text-[26px] font-medium leading-[1.25] text-muted">{t('briefText')}</p>
            <ButtonLink href="/brief" variant="ghost" arrow>{t('briefLink')}</ButtonLink>
          </div>
        </div>
      </div>

      <div className="min-w-0 lg:border-l lg:border-line lg:pl-16">
        <ContactForm
          locale={locale}
          // No fragment: a URL fragment makes browsers skip the summary's autofocus after a no-JS submit.
          permalink={localizedPath('/contact', locale)}
          labels={{
            ...shared,
            title: t('formTitle'),
            submit: t('submit'),
            name: t('name'),
            email: { label: t('emailField.label'), hint: t('emailField.hint') },
            message: { label: t('message.label'), hint: t('message.hint') },
          }}
        />
      </div>
    </section>
  );
}
