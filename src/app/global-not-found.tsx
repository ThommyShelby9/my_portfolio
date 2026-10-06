import type { Metadata } from 'next';
import { buttonClassName } from '@/components/site/ButtonLink';
import { localizedPath } from '@/lib/i18n/localized-path';
import { OWNER } from '@/lib/site';
import { archivo, mono } from '@/styles/fonts';
import en from '../../messages/en.json';
import fr from '../../messages/fr.json';
import '@/styles/globals.css';

// The 404 for URLs no route matches at all: one segment that is not a locale and that the proxy skips
// (/foo.php, /wp-login.php). Every deeper unknown path gets the localized not-found page through
// [locale]/[...rest] (see [locale]/layout.tsx). This one renders outside the locale layout and cannot
// know the visitor's language, so it speaks both, French first.

export const metadata: Metadata = {
  title: `${fr.notFound.kicker} · ${OWNER.name}`,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false" className="transition-transform group-hover:translate-x-0.5">
    <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export default function GlobalNotFound() {
  return (
    <html lang="fr" className={`${archivo.variable} ${mono.variable}`}>
      <body>
        <main id="main" data-global-not-found className="mx-auto flex min-h-svh max-w-[1280px] flex-col justify-center px-5 py-[12vh] md:px-10">
          <a href="/" className="mb-[8vh] self-start font-display text-[22px] font-extrabold uppercase tracking-[-0.025em] text-ivory no-underline">
            {OWNER.name}
          </a>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-signal">
            {fr.notFound.kicker} <span lang="en">· {en.notFound.kicker}</span>
          </p>
          <h1 className="mt-5 max-w-[24ch] font-display text-[clamp(44px,6vw,88px)] font-extrabold uppercase leading-[0.96] tracking-[-0.025em]">
            {fr.notFound.title}
          </h1>
          <p className="mt-6 max-w-[48ch] text-[16.5px] leading-[1.7] text-muted">{fr.notFound.text}</p>
          <div className="mt-9 flex flex-wrap gap-3.5">
            <a href={localizedPath('/realisations', 'fr')} data-button className={buttonClassName('primary')}>
              {fr.notFound.work}
              {ARROW}
            </a>
            <a href="/" data-button className={buttonClassName('ghost')}>
              {fr.notFound.back}
            </a>
          </div>
          <div lang="en" className="mt-[8vh] max-w-[48ch] border-t border-line pt-8">
            <p className="font-display text-[clamp(24px,2.4vw,32px)] font-extrabold uppercase tracking-[-0.02em] leading-[1.2]">{en.notFound.title}</p>
            <p className="mt-3 text-[15px] leading-[1.7] text-muted">{en.notFound.text}</p>
            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
              <a href={localizedPath('/realisations', 'en')} className="text-ivory underline decoration-edge underline-offset-4 hover:text-signal hover:decoration-signal">
                {en.notFound.work}
              </a>
              <a href={localizedPath('/', 'en')} className="text-ivory underline decoration-edge underline-offset-4 hover:text-signal hover:decoration-signal">
                {en.notFound.back}
              </a>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
