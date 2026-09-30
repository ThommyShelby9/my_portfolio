import 'server-only';
import type { ReactNode } from 'react';
import { getMessages, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { OWNER } from '@/lib/site';
import type { FeedbackLabels } from './FormFeedback';

const inlineLink = 'border-b pb-0.5 text-ivory no-underline transition-colors hover:border-champagne hover:text-champagne';

/**
 * Strings every form needs, resolved on the server: client components never read messages
 * (the layout passes `messages={null}`), so labels and rich texts travel as props.
 */
export async function formLabels(locale: Locale): Promise<{
  required: string;
  pending: string;
  honeypot: string;
  privacy: ReactNode;
  feedback: FeedbackLabels;
  errors: Record<string, string>;
}> {
  const [f, messages] = await Promise.all([getTranslations({ locale, namespace: 'forms' }), getMessages({ locale })]);
  // The address comes from OWNER as an argument; the `mail` tag makes it a mailto link.
  const direct = {
    email: OWNER.email,
    mail: (chunks: ReactNode) => (
      <a href={`mailto:${OWNER.email}`} className={`${inlineLink} whitespace-nowrap border-champagne`}>{chunks}</a>
    ),
  };
  return {
    required: f('required'),
    pending: f('pending'),
    honeypot: f('honeypot'),
    privacy: f.rich('privacy', {
      link: (chunks) => <Link href="/confidentialite" className={`${inlineLink} border-edge`}>{chunks}</Link>,
    }),
    feedback: {
      summaryTitle: f('summaryTitle'),
      summaryText: f('summaryText'),
      summaryGeneric: f('summaryGeneric'),
      rateLimited: f.rich('rateLimited', direct),
      failed: f.rich('failed', direct),
    },
    errors: messages.errors as Record<string, string>,
  };
}
