import { Reveal } from '@/components/motion/Reveal';
import { Link } from '@/i18n/navigation';
import type { Service } from '@/lib/content/services';

/**
 * The services as an editorial list, one row each: number, title, summary. The whole row is
 * clickable through the title link (stretched with ::after), so the accessible name stays the title.
 */
export function ServiceList({ services, more }: { services: Service[]; more: string }) {
  return (
    <Reveal as="ol" className="mx-auto mt-[6vh] max-w-[1280px] px-5 pb-[10vh] md:px-10">
      {services.map((s, i) => (
        <li key={s.slug} data-reveal className="group relative grid gap-4 border-b border-line py-9 md:grid-cols-[64px_minmax(0,5fr)_minmax(0,6fr)] md:gap-10">
          <span aria-hidden="true" className="font-mono text-xs text-signal md:pt-3">{String(i + 1).padStart(2, '0')}</span>
          <h2 className="font-display text-[clamp(26px,2.6vw,38px)] font-extrabold uppercase leading-[0.98] tracking-[-0.02em]">
            <Link
              href={{ pathname: '/services/[slug]', params: { slug: s.slug } }}
              className="no-underline transition-colors duration-300 after:absolute after:inset-0 after:content-[''] group-hover:text-signal"
            >
              {s.title}
            </Link>
          </h2>
          <div>
            <p className="max-w-[56ch] text-[15.5px] leading-[1.7] text-muted">{s.summary}</p>
            <p aria-hidden="true" className="mt-4 inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.12em] text-faint transition-colors group-hover:text-signal">
              {more}
              <svg width="14" height="14" viewBox="0 0 14 14" focusable="false" className="transition-transform group-hover:translate-x-0.5">
                <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </p>
          </div>
        </li>
      ))}
    </Reveal>
  );
}
