import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BriefForm, type BriefFormLabels } from '@/components/forms/BriefForm';
import { formLabels } from '@/components/forms/shared-labels';
import { IndexHeader } from '@/components/work/WorkIndex';
import type { Locale } from '@/i18n/routing';
import { BRIEF_CHOICES, BRIEF_RESOURCES } from '@/lib/forms/brief-options';
import { localizedPath } from '@/lib/i18n/localized-path';
import { pageMetadata } from '@/lib/seo/page-metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/brief'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'brief' });
  return pageMetadata({ locale: locale as Locale, href: '/brief', title: t('metaTitle'), description: t('metaDescription') });
}

export default async function BriefPage({ params }: PageProps<'/[locale]/brief'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, shared] = await Promise.all([getTranslations({ locale, namespace: 'brief' }), formLabels(locale)]);

  const choices = (field: keyof typeof BRIEF_CHOICES) => ({
    label: t(`${field}.label`),
    options: BRIEF_CHOICES[field].map(([value, key]) => ({ value, label: t(`${field}.${key}`) })),
  });
  const section = (key: string) => ({ legend: t(`sections.${key}.legend`), text: t(`sections.${key}.text`) });

  const labels: BriefFormLabels = {
    ...shared,
    formLabel: t('formLabel'),
    submit: t('submit'),
    sections: { project: section('project'), context: section('context'), frame: section('frame'), you: section('you') },
    projectType: choices('projectType'),
    pitch: { label: t('pitch.label'), hint: t('pitch.hint') },
    currentState: choices('currentState'),
    teamSize: choices('teamSize'),
    resources: { label: t('resources.label'), options: BRIEF_RESOURCES.map((name) => ({ name, label: t(`resources.${name}`) })) },
    notes: { label: t('notes.label'), hint: t('notes.hint') },
    deadline: choices('deadline'),
    budget: { ...choices('budget'), hint: t('budget.hint') },
    firstName: t('firstName'),
    lastName: t('lastName'),
    email: { label: t('email.label'), hint: t('email.hint') },
    company: t('company'),
    website: { label: t('website.label'), placeholder: t('website.placeholder') },
    source: t('source'),
    firstContact: t('firstContact'),
    prefersCall: t('prefersCall'),
  };

  return (
    <>
      <IndexHeader kicker={t('kicker')} title={t('title')} lede={t('lede')} meta={t('meta')} />
      <BriefForm locale={locale} permalink={`${localizedPath('/brief', locale)}#brief-form`} labels={labels} />
    </>
  );
}

