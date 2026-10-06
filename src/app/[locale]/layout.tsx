import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { HitBeacon } from '@/components/site/HitBeacon';
import { SkipLink } from '@/components/site/SkipLink';
import { SITE_URL } from '@/lib/site';
import { routing, type Locale } from '@/i18n/routing';
import { archivo, mono } from '@/styles/fonts';
import '@/styles/globals.css';


// Only fr and en. A first segment that is not a locale can only come from a path the proxy does not
// rewrite (a file extension, /api/...). Alone (/foo.php), it matches no route and gets the global 404
// (app/global-not-found.tsx). Deeper (/foo/bar.php, /api/nope), it reaches [locale]/[...rest], whose
// page 404s: the layout then renders the French shell around it (see localeOf), so the visitor gets
// the styled 404, not the framework's bare page (which a notFound() in this root layout would give).
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const localeOf = (raw: string): Locale => (hasLocale(routing.locales, raw) ? raw : routing.defaultLocale);

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const locale = localeOf((await params).locale);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    metadataBase: new URL(SITE_URL),
    title: t('title'),
    description: t('description'),
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
  };
}

export const viewport = { themeColor: '#121211' };

// Adds `js` before first paint so reveal styles only hide content when JS runs.
// The 2.5 s timer rescues the content only when the reveal code never ran
// (it adds `reveal-ready` on hydration); otherwise reveals stay scroll-driven.
const EARLY_JS = `document.documentElement.classList.add('js');setTimeout(function(){var c=document.documentElement.classList;if(!c.contains('reveal-ready'))c.add('reveal-done')},2500);`;

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const locale = localeOf((await params).locale);
  setRequestLocale(locale);
  return (
    <html lang={locale} className={`${archivo.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: EARLY_JS }} />
      </head>
      <body>
        {/* No client component reads messages: skip serializing the dictionary into every page. */}
        <NextIntlClientProvider messages={null}>
          <SkipLink />
          <Header />
          <main id="main" tabIndex={-1} className="relative focus:outline-none">{children}</main>
          <Footer />
          <HitBeacon />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
