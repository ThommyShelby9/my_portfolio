import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';
import { BRIEF_CHOICES, BRIEF_RESOURCES } from '@/lib/forms/brief-options';
import { OWNER, SITE_URL } from '@/lib/site';
import type { MailInput } from './mailer';

export interface Submission {
  type: 'brief' | 'contact';
  locale: 'fr' | 'en';
  payload: Record<string, unknown>;
}

type Locale = Submission['locale'];
type Row = { label: string; value: string; long?: boolean; href?: string };
type Section = { title: string; rows: Row[] };

const MESSAGES = { fr, en } as const;

/** Words of the emails themselves (the form labels come from messages/*.json). */
const COPY = {
  fr: {
    yes: 'Oui',
    no: 'Non',
    none: 'Non renseigné',
    nobody: 'Personne pour l’instant',
    language: { fr: 'Français', en: 'Anglais' },
    formLanguage: 'Langue du formulaire',
    person: 'La personne',
    ownerBrief: 'Nouveau brief',
    ownerContact: 'Nouveau message',
    ownerIntro: (form: string) => `Reçu depuis ${form} du site.`,
    formBrief: 'le formulaire de brief',
    formContact: 'le formulaire de contact',
    reply: (name: string) => `Répondre à ${name}`,
    contactSection: 'Le message',
    nameLabel: 'Nom',
    messageLabel: 'Message',
    confirmBriefSubject: 'Votre brief est bien arrivé',
    confirmContactSubject: 'Votre message est bien arrivé',
    hello: (name: string) => `Bonjour ${name},`,
    thanksBrief: 'Merci pour votre brief. Je l’ai bien reçu et je vous réponds sous 48 heures, à cette adresse.',
    thanksContact: 'Merci pour votre message. Je l’ai bien reçu et je vous réponds sous 48 heures, à cette adresse.',
    recap: 'Ce que vous m’avez indiqué',
    addMore: 'Pour ajouter une précision, répondez simplement à cet e-mail.',
    signatureRole: 'Head of Engineering & Innovation · KPS Groupe',
    footer: 'Vous recevez cet e-mail parce que cette adresse a été saisie sur rostelmissimawu.com.',
  },
  en: {
    yes: 'Yes',
    no: 'No',
    none: 'Not given',
    nobody: 'Nobody yet',
    language: { fr: 'French', en: 'English' },
    formLanguage: 'Form language',
    person: 'The person',
    ownerBrief: 'New brief',
    ownerContact: 'New message',
    ownerIntro: (form: string) => `Received from ${form} on the site.`,
    formBrief: 'the brief form',
    formContact: 'the contact form',
    reply: (name: string) => `Reply to ${name}`,
    contactSection: 'The message',
    nameLabel: 'Name',
    messageLabel: 'Message',
    confirmBriefSubject: 'Your brief arrived',
    confirmContactSubject: 'Your message arrived',
    hello: (name: string) => `Hello ${name},`,
    thanksBrief: 'Thank you for your brief. It arrived and I will reply within 48 hours, at this address.',
    thanksContact: 'Thank you for your message. It arrived and I will reply within 48 hours, at this address.',
    recap: 'What you told me',
    addMore: 'To add anything, simply reply to this email.',
    signatureRole: 'Head of Engineering & Innovation · KPS Groupe',
    footer: 'You receive this email because this address was entered on rostelmissimawu.com.',
  },
} as const;

/** One line, no header injection (the subject and names end up in mail headers). */
const oneLine = (v: unknown) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim();

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const text = (v: unknown, locale: Locale) => {
  const s = typeof v === 'string' ? v.trim() : v == null ? '' : String(v);
  return s === '' ? COPY[locale].none : s;
};

type ChoiceField = keyof typeof BRIEF_CHOICES;

/** The visible label of a brief choice (e.g. `2-5` → « 2 à 5 personnes »). */
function choice(field: ChoiceField, value: unknown, locale: Locale): string {
  if (value == null || value === '') return COPY[locale].none;
  const pair = (BRIEF_CHOICES[field] as readonly (readonly [string, string])[]).find(([v]) => v === value);
  const labels = MESSAGES[locale].brief[field] as Record<string, string>;
  return pair ? labels[pair[1]] : String(value);
}

function label(field: ChoiceField | 'pitch' | 'notes' | 'email' | 'website', locale: Locale): string {
  return (MESSAGES[locale].brief[field] as { label: string }).label;
}

function resources(p: Record<string, unknown>, locale: Locale): string {
  const labels = MESSAGES[locale].brief.resources as Record<string, string>;
  const picked = BRIEF_RESOURCES.filter((k) => p[k] === true).map((k) => labels[k]);
  return picked.length > 0 ? picked.join(', ') : COPY[locale].nobody;
}

/** The brief, section by section, with the form's own labels (choices only when `choicesOnly`). */
function briefSections(p: Record<string, unknown>, locale: Locale, choicesOnly = false): Section[] {
  const b = MESSAGES[locale].brief;
  const c = COPY[locale];
  const legend = (k: keyof typeof b.sections) => b.sections[k].legend.replace(/^\d+\s*·\s*/, '');
  const project: Row[] = [{ label: b.projectType.label, value: choice('projectType', p.projectType, locale) }];
  if (!choicesOnly) project.push({ label: label('pitch', locale), value: text(p.pitch, locale), long: true });
  const context: Row[] = [
    { label: b.currentState.label, value: choice('currentState', p.currentState, locale) },
    { label: b.teamSize.label, value: choice('teamSize', p.teamSize, locale) },
    { label: b.resources.label, value: resources(p, locale) },
  ];
  if (!choicesOnly) context.push({ label: label('notes', locale), value: text(p.notes, locale), long: true });
  const frame: Row[] = [
    { label: b.deadline.label, value: choice('deadline', p.deadline, locale) },
    { label: b.budget.label, value: choice('budget', p.budget, locale) },
  ];
  const sections: Section[] = [
    { title: legend('project'), rows: project },
    { title: legend('context'), rows: context },
    { title: legend('frame'), rows: frame },
  ];
  if (!choicesOnly) {
    const email = oneLine(p.email);
    const website = oneLine(p.website);
    sections.push({
      title: c.person,
      rows: [
        { label: c.nameLabel, value: `${oneLine(p.firstName)} ${oneLine(p.lastName)}`.trim() || c.none },
        { label: label('email', locale), value: email || c.none, href: email ? `mailto:${email}` : undefined },
        { label: b.company, value: text(p.company, locale) },
        { label: label('website', locale), value: website || c.none, href: /^https?:\/\//.test(website) ? website : undefined },
        { label: b.source, value: text(p.source, locale) },
        { label: b.firstContact, value: p.prefersCall === true ? `${c.yes}${colon(locale)} ${b.prefersCall.toLowerCase()}` : c.no },
      ],
    });
  }
  return sections;
}

function contactSections(p: Record<string, unknown>, locale: Locale): Section[] {
  const c = COPY[locale];
  const email = oneLine(p.email);
  return [
    {
      title: c.contactSection,
      rows: [
        { label: c.nameLabel, value: text(oneLine(p.name), locale) },
        { label: MESSAGES[locale].brief.email.label, value: email || c.none, href: email ? `mailto:${email}` : undefined },
        { label: c.messageLabel, value: text(p.message, locale), long: true },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------------------------
// Rendering: plain text, and table-based HTML with inline styles (what mail clients understand).

const INK = '#121211';
const SIGNAL = '#ff5a1f';
const MUTED = '#6b6964';

/** « Label : valeur » in French (no-break space before the colon), « Label: value » in English. */
const colon = (locale: Locale) => (locale === 'fr' ? ' :' : ':');

function renderText(intro: string[], sections: Section[], outro: string[], locale: Locale): string {
  const sep = colon(locale);
  const body = sections
    .map((s) => [
      s.title.toUpperCase(),
      ...s.rows.map((r) => {
        // A question already ends its label: « Où en est le projet ? Une idée ».
        const mark = r.label.endsWith('?') ? '' : sep;
        return r.long ? `${r.label}${mark}\n${r.value}` : `${r.label}${mark} ${r.value}`;
      }),
    ].join('\n'))
    .join('\n\n');
  return [...intro, '', body, '', ...outro].join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function renderHtml({ title, intro, sections, action, outro, footer }: {
  title: string;
  intro: string[];
  sections: Section[];
  action?: { label: string; href: string };
  outro: string[];
  /** Small print in the bottom bar, before the site address. */
  footer?: string;
}): string {
  const p = (s: string) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${INK}">${escapeHtml(s)}</p>`;
  const value = (r: Row) => {
    const v = escapeHtml(r.value);
    return r.href ? `<a href="${escapeHtml(r.href)}" style="color:${INK};text-decoration:underline">${v}</a>` : v;
  };
  const table = sections
    .map(
      (s) =>
        `<tr><td colspan="2" style="padding:22px 0 8px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${SIGNAL};border-bottom:1px solid #e3e0d9">${escapeHtml(s.title)}</td></tr>` +
        s.rows
          .map(
            (r) =>
              `<tr><td valign="top" style="padding:10px 16px 10px 0;width:38%;font-size:13px;color:${MUTED};border-bottom:1px solid #f0ede7">${escapeHtml(r.label)}</td>` +
              `<td valign="top" style="padding:10px 0;font-size:14px;line-height:1.55;color:${INK};white-space:pre-wrap;border-bottom:1px solid #f0ede7">${value(r)}</td></tr>`,
          )
          .join(''),
    )
    .join('');
  const button = action
    ? `<p style="margin:26px 0 0"><a href="${escapeHtml(action.href)}" style="display:inline-block;background:${INK};color:#edeae4;padding:12px 20px;border-radius:2px;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;text-decoration:none">${escapeHtml(action.label)}</a></p>`
    : '';
  return (
    `<!doctype html><html><body style="margin:0;padding:0;background:#f4f2ee">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee"><tr><td align="center" style="padding:24px 12px">` +
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;font-family:Arial,Helvetica,sans-serif">` +
    `<tr><td style="background:${INK};padding:18px 28px;font-size:18px;font-weight:bold;color:#edeae4;letter-spacing:-0.5px">RP <span style="display:inline-block;width:22px;height:1px;background:${SIGNAL};vertical-align:middle"></span></td></tr>` +
    `<tr><td style="padding:28px 28px 8px"><h1 style="margin:0 0 16px;font-size:22px;line-height:1.2;text-transform:uppercase;letter-spacing:-0.5px;color:${INK}">${escapeHtml(title)}</h1>` +
    intro.map(p).join('') +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${table}</table>` +
    button +
    `<div style="margin-top:24px">${outro.map(p).join('')}</div></td></tr>` +
    `<tr><td style="padding:16px 28px 22px;font-size:11px;line-height:1.5;color:${MUTED};border-top:1px solid #f0ede7">${footer ? `${escapeHtml(footer)}<br>` : ''}${escapeHtml(SITE_URL.replace(/^https?:\/\//, ''))}</td></tr>` +
    `</table></td></tr></table></body></html>`
  );
}

/** The copy Rostel receives: every answer with the form's French labels, and a reply button. */
export function buildSubmissionEmail(sub: Submission): MailInput {
  const p = sub.payload;
  const c = COPY.fr;
  const email = oneLine(p.email);
  const name =
    sub.type === 'brief' ? `${oneLine(p.firstName)} ${oneLine(p.lastName)}`.trim() : oneLine(p.name);
  const kind = sub.type === 'brief' ? c.ownerBrief : c.ownerContact;
  const subject =
    sub.type === 'brief' ? `${kind} · ${choice('projectType', p.projectType, 'fr')} · ${name}` : `${kind} · ${name}`;
  const sections = sub.type === 'brief' ? briefSections(p, 'fr') : contactSections(p, 'fr');
  sections[sections.length - 1].rows.push({ label: c.formLanguage, value: c.language[sub.locale] });
  const intro = [c.ownerIntro(sub.type === 'brief' ? c.formBrief : c.formContact)];
  const action = email ? { label: c.reply(name || email), href: `mailto:${email}` } : undefined;
  return {
    subject,
    text: renderText([subject, ...intro], sections, action ? [`${action.label}${colon('fr')} ${email}`] : [], 'fr'),
    html: renderHtml({ title: kind, intro: [subject, ...intro], sections, action, outro: [] }),
    replyTo: email || undefined,
  };
}

/**
 * The acknowledgement the visitor receives, in the language of the form. It never repeats what
 * they typed freely (pitch, notes, message): a confirmation must not carry text an attacker chose
 * to a third party's inbox. Only the first name and the brief's fixed choices appear.
 */
export function buildConfirmationEmail(sub: Submission): MailInput & { to: string } {
  const p = sub.payload;
  const c = COPY[sub.locale];
  const to = oneLine(p.email);
  const first = (sub.type === 'brief' ? oneLine(p.firstName) : oneLine(p.name).split(' ')[0]).slice(0, 40);
  const subject = sub.type === 'brief' ? c.confirmBriefSubject : c.confirmContactSubject;
  const intro = [c.hello(first), sub.type === 'brief' ? c.thanksBrief : c.thanksContact];
  const sections = sub.type === 'brief' ? [{ title: c.recap, rows: briefSections(p, sub.locale, true).flatMap((s) => s.rows) }] : [];
  const outro = [c.addMore, '', OWNER.name, c.signatureRole, SITE_URL.replace(/^https?:\/\//, '')];
  return {
    to,
    subject,
    text: renderText(intro, sections, [...outro, '', c.footer], sub.locale),
    html: renderHtml({ title: subject, intro, sections, outro: [c.addMore, `${OWNER.name} · ${c.signatureRole}`], footer: c.footer }),
    replyTo: OWNER.email,
  };
}
