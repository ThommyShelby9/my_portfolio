import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Entry, TerminalContext, TerminalMessages } from '@/components/terminal/commands';
import { TerminalLoader } from '@/components/terminal/TerminalLoader';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { getProjects, type Project } from '@/lib/content/load';
import { localizedPath } from '@/lib/i18n/localized-path';
import { CV_PDF, currentRole } from '@/lib/profile/cv-data';
import { pageMetadata } from '@/lib/seo/page-metadata';
import { OWNER } from '@/lib/site';

// Prerendered at build time: the slugs and titles come from content/, which the server does not ship.
export const dynamic = 'force-static';

export async function generateMetadata({ params }: PageProps<'/[locale]/terminal'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'terminal' });
  return {
    ...pageMetadata({ locale: locale as Locale, href: '/terminal', title: t('metaTitle'), description: t('metaDescription') }),
    robots: { index: false },
  };
}

const KEYS_ID = 'terminal-keys';
const link = 'border-b border-edge pb-0.5 text-ivory no-underline transition-colors hover:border-signal hover:text-signal';

type Notes = { coBuilt: string; contribution: string; pitched: string; unsolicited: string };

/** The same honesty qualifiers as the site: co-authors, contribution roles, proposals (owner rule 11). */
function note(p: Project, n: Notes): string | undefined {
  if (p.kind === 'exploration') return p.proposal === 'pitched' ? n.pitched : n.unsolicited;
  if (p.coauthors.length > 0) return n.coBuilt.replace('{names}', p.coauthors.join(', '));
  if (/^(contribution|engineering contribution)/i.test(p.role)) return n.contribution;
  return undefined;
}

// `ls` reads like a directory listing: alphabetical, as a shell sorts.
const entries = (projects: Project[], n: Notes): Entry[] =>
  projects
    .map((p) => { const extra = note(p, n); return { slug: p.slug, title: extra ? `${p.title} · ${extra}` : p.title }; })
    .sort((a, b) => a.slug.localeCompare(b.slug));

export default async function TerminalPage({ params }: PageProps<'/[locale]/terminal'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [t, realisations, explorations] = await Promise.all([
    getTranslations({ locale, namespace: 'terminal' }),
    getProjects('realisation', locale),
    getProjects('exploration', locale),
  ]);

  const notes = t.raw('notes') as Notes;
  const out = t.raw('out') as TerminalMessages;
  const ctx: TerminalContext = {
    locale,
    messages: out,
    realisations: entries(realisations, notes),
    explorations: entries(explorations, notes),
    profile: {
      name: OWNER.name,
      role: currentRole().title[locale],
      employer: OWNER.employer,
      years: OWNER.yearsExperience,
      lead: OWNER.yearsLead,
    },
    cvPdf: CV_PDF[locale],
  };

  const fallback = [
    { href: localizedPath('/realisations', locale), label: t('fallback.work') },
    { href: localizedPath('/explorations', locale), label: t('fallback.explorations') },
    { href: localizedPath('/brief', locale), label: t('fallback.brief') },
    { href: localizedPath('/contact', locale), label: t('fallback.contact') },
    { href: CV_PDF[locale], label: t('fallback.cv') },
    { href: localizedPath('/', locale), label: t('fallback.home') },
  ];

  return (
    <section className="mx-auto max-w-[1040px] px-5 pb-[12vh] pt-[5vh] md:px-10 md:pt-[7vh]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
        <h1 className="font-display text-[clamp(30px,3.6vw,44px)] font-extrabold uppercase leading-[1.1] tracking-[-0.025em]">{t('title')}</h1>
        <Link href="/" className={`inline-flex items-center gap-2 font-mono text-xs font-medium ${link}`}>
          <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
            <path d="M12 7H2M6 3 2 7l4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          {t('back')}
        </Link>
      </div>

      <div className="mt-8 border border-line bg-graphite md:mt-10">
        <p aria-hidden="true" className="border-b border-line bg-graphite-2 px-4 py-2.5 font-mono text-[11px] text-faint sm:px-6">
          rostel@cotonou: ~
        </p>
        <div className="h-[min(62svh,600px)] min-h-[320px]">
          <TerminalLoader key={locale} ctx={ctx} labels={{ input: t('label'), output: t('output') }} describedBy={KEYS_ID} />
          <noscript>
            <div className="px-4 py-4 font-mono text-[13px] leading-[1.7] sm:px-6 sm:py-5">
              <p className="text-muted">{t('fallback.text')}</p>
              <ul className="mt-4 grid gap-2.5">
                {fallback.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className={link}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </noscript>
        </div>
      </div>

      <p id={KEYS_ID} className="mt-4 font-mono text-[11.5px] leading-[1.7] text-faint [html:not(.js)_&]:hidden">{t('keys')}</p>
    </section>
  );
}
