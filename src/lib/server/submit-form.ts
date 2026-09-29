import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { z } from 'zod';
import type { routing } from '@/i18n/routing';
import type { FormState } from '@/lib/forms/form-state';
import { parseForm } from '@/lib/forms/parse-form';
import { localizedPath } from '@/lib/i18n/localized-path';
import { clientIp } from './client-ip';
import { deliver } from './deliver';

type Options<S extends z.ZodType<{ locale: 'fr' | 'en' }>> = {
  type: 'brief' | 'contact';
  schema: S;
  /** Echo allow-list: never the honeypot or Next's $ACTION_* fields. */
  fields: readonly string[];
  formData: FormData;
  /** Localized thank-you route, reached with a redirect (works with and without JS). */
  thanks: keyof typeof routing.pathnames;
};

function echo(formData: FormData, fields: readonly string[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && fields.includes(key)) values[key] = value;
  }
  return values;
}

/** Shared body of the brief and contact server actions. Redirects on success, returns the form state otherwise. */
export async function submitForm<S extends z.ZodType<{ locale: 'fr' | 'en' }>>({
  type,
  schema,
  fields,
  formData,
  thanks,
}: Options<S>): Promise<FormState> {
  const parsed = parseForm(schema, formData, fields);
  if (!parsed.ok) return { status: 'invalid', fieldErrors: parsed.fieldErrors, values: parsed.values };

  const { locale, ...payload } = parsed.data as z.output<S> & Record<string, unknown>;
  const honeypot = formData.get('nickname');
  const result = await deliver({
    type,
    locale,
    payload,
    ip: clientIp(await headers()),
    honeypot: typeof honeypot === 'string' ? honeypot : '',
  });

  // redirect() throws a control-flow exception: keep it outside any try/catch.
  if (result.status === 'ok') redirect(localizedPath(thanks, locale));
  return { status: result.status, fieldErrors: {}, values: echo(formData, fields) };
}
