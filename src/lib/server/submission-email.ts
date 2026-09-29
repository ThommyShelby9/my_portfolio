import type { MailInput } from './mailer';

export interface Submission {
  type: 'brief' | 'contact';
  locale: 'fr' | 'en';
  payload: Record<string, unknown>;
}

const oneLine = (v: unknown) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim();

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function display(v: unknown): string {
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  if (v == null || v === '') return '-';
  return String(v);
}

export function buildSubmissionEmail(sub: Submission): MailInput {
  const p = sub.payload;
  const subject =
    sub.type === 'brief'
      ? `[Brief] ${oneLine(p.projectType)} \u00b7 ${oneLine(p.firstName)} ${oneLine(p.lastName)}`
      : `[Contact] ${oneLine(p.name)}`;

  const rows = Object.entries(p).map(([k, v]) => [k, display(v)] as const);
  rows.push(['locale', sub.locale]);

  const text = rows.map(([k, v]) => (v.includes('\n') ? `${k}:\n${v}` : `${k}: ${v}`)).join('\n\n');
  const html =
    `<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">` +
    rows
      .map(
        ([k, v]) =>
          `<tr><th align="left" valign="top">${escapeHtml(k)}</th>` +
          `<td style="white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
      )
      .join('') +
    `</table>`;

  const email = typeof p.email === 'string' ? oneLine(p.email) : '';
  return { subject, text, html, replyTo: email || undefined };
}
