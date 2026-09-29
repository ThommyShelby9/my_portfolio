import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { SkipLink } from '@/components/site/SkipLink';
import { routing, type Locale } from '@/i18n/routing';
import { mono, sans, serif } from '@/styles/fonts';
import '@/styles/globals.css';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rostelmissimawu.com';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'meta' });
  return {
    metadataBase: new URL(SITE),
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

export const viewport = { themeColor: '#101112' };

// Adds `js` before first paint so reveal styles only hide content when JS runs.
// The 2.5 s timer rescues the content only when the reveal code never ran
// (it adds `reveal-ready` on hydration); otherwise reveals stay scroll-driven.
const EARLY_JS = `document.documentElement.classList.add('js');setTimeout(function(){var c=document.documentElement.classList;if(!c.contains('reveal-ready'))c.add('reveal-done')},2500);`;

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <html lang={locale} className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: EARLY_JS }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <SkipLink />
          <Header />
          <main id="main" tabIndex={-1} className="relative">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
