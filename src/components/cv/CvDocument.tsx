import { getTranslations } from 'next-intl/server';
import { PeriodTime } from '@/components/about/PeriodTime';
import { buttonClassName } from '@/components/site/ButtonLink';
import type { Locale } from '@/i18n/routing';
import { localizedPath } from '@/lib/i18n/localized-path';
import {
  CV_PDF,
  EDUCATION,
  LINKS,
  ROLES,
  SKILL_GROUPS,
  currentRole,
  educationHeading,
  roleKindLabel,
  term,
} from '@/lib/profile/cv-data';
import { OWNER, SITE_URL } from '@/lib/site';

export type CvProject = { slug: string; title: string; role: string; year: number; summary: string; metrics: string[] };

/** "https://www.linkedin.com/in/x" -> "linkedin.com/in/x": links are printed as readable text. */
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/**
 * The CV, one document for the screen and for print. The screen keeps the site's look; print
 * (src/styles/cv.css) turns it into a white A4 page with no site chrome. Every fact comes from
 * cv-data, the About lede and the case studies' owner-confirmed proofs.
 */
export async function CvDocument({ locale, projects }: { locale: Locale; projects: CvProject[] }) {
  const [t, about] = await Promise.all([getTranslations({ locale, namespace: 'cv' }), getTranslations({ locale, namespace: 'about' })]);
  const role = currentRole();
  const site = new URL(localizedPath('/', locale), SITE_URL).toString();
  return (
    <article data-cv className="cv">
      <header className="cv-head">
        <div>
          <p className="cv-kicker">{t('kicker')}</p>
          <h1 className="cv-name">{OWNER.name}</h1>
          <p className="cv-title">{about('title')}</p>
          <p className="cv-role">
            {role.title[locale]} · {role.organisation}
          </p>
        </div>
        <div data-cv-screen className="cv-actions">
          <a href={CV_PDF[locale]} download type="application/pdf" data-cv-download className={buttonClassName('primary')}>
            {t('download')}
          </a>
          <p className="cv-note">{t('downloadNote')}</p>
        </div>
      </header>

      <div className="cv-body">
        <div className="cv-main">
          <section aria-labelledby="cv-profile" data-area="profile" className="cv-section">
            <h2 id="cv-profile" className="cv-h2">{t('profile')}</h2>
            <p className="cv-lede">{about('lede')}</p>
          </section>

          <section aria-labelledby="cv-experience" data-area="experience" className="cv-section">
            <h2 id="cv-experience" className="cv-h2">{t('experience')}</h2>
            <ol className="cv-list">
              {ROLES.map((r) => {
                const kind = roleKindLabel(r, locale);
                return (
                  <li key={r.id}>
                    <div className="cv-entry-head">
                      <h3 className="cv-h3">{r.organisation}</h3>
                      <p className="cv-when">
                        <PeriodTime period={r.period} locale={locale} />
                      </p>
                    </div>
                    <p className="cv-what">
                      {r.title[locale]}
                      {kind && <span className="cv-soft"> · {kind}</span>}
                      {r.location && <span className="cv-soft"> · {r.location[locale]}</span>}
                    </p>
                    <p className="cv-desc">{r.summary[locale]}</p>
                  </li>
                );
              })}
            </ol>
          </section>

        </div>

        <aside className="cv-side">
          <section aria-labelledby="cv-contact" data-area="contact" className="cv-section">
            <h2 id="cv-contact" className="cv-h2">{t('contact')}</h2>
            <dl className="cv-dl">
              <div>
                <dt>{t('email')}</dt>
                <dd>
                  <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
                </dd>
              </div>
              <div>
                <dt>LinkedIn</dt>
                <dd>
                  <a href={LINKS.linkedin} rel="me noopener">{bare(LINKS.linkedin)}</a>
                </dd>
              </div>
              <div>
                <dt>GitHub</dt>
                <dd>
                  <a href={LINKS.github} rel="me noopener">{bare(LINKS.github)}</a>
                </dd>
              </div>
              <div>
                <dt>{t('site')}</dt>
                <dd>
                  <a href={site}>{bare(site)}</a>
                </dd>
              </div>
              <div>
                <dt>{t('based')}</dt>
                <dd>{t('basedValue')}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="cv-skills" data-area="skills" className="cv-section">
            <h2 id="cv-skills" className="cv-h2">{t('skills')}</h2>
            <ul className="cv-skills">
              {SKILL_GROUPS.map((g) => (
                <li key={g.id}>
                  <h3 className="cv-h4">{g.label[locale]}</h3>
                  <p className="cv-desc">{g.items.map((item) => term(item, locale)).join(', ')}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="cv-education" data-area="education" className="cv-section">
            <h2 id="cv-education" className="cv-h2">{t('education')}</h2>
            <ol className="cv-list cv-list-tight">
              {EDUCATION.map((e) => (
                <li key={e.id}>
                  <div className="cv-entry-head">
                    <h3 className="cv-h4">{educationHeading(e, locale)}</h3>
                    <p className="cv-when">
                      <PeriodTime period={e.period} locale={locale} />
                    </p>
                  </div>
                  <p className="cv-desc">{e.field[locale]}</p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <section aria-labelledby="cv-projects" data-area="projects" className="cv-section cv-projects">
        <h2 id="cv-projects" className="cv-h2">{t('projects')}</h2>
        <ol className="cv-list cv-grid">
          {projects.map((p) => {
            const url = new URL(localizedPath('/realisations/[slug]', locale, { slug: p.slug }), SITE_URL).toString();
            return (
              <li key={p.slug}>
                <div className="cv-entry-head">
                  <h3 className="cv-h3">{p.title}</h3>
                  <p className="cv-when">{p.year}</p>
                </div>
                <p className="cv-what">{p.role}</p>
                <p className="cv-desc">{p.summary}</p>
                {p.metrics.length > 0 && (
                  <ul className="cv-metrics">
                    {p.metrics.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                )}
                <p className="cv-link">
                  <span className="cv-soft">{t('caseStudy')} · </span>
                  <a href={url}>{bare(url)}</a>
                </p>
              </li>
            );
          })}
        </ol>
      </section>
    </article>
  );
}
