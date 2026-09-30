'use client';

import { useActionState, type ReactNode } from 'react';
import { submitContact } from '@/app/[locale]/contact/actions';
import { initialFormState } from '@/lib/forms/form-state';
import { Field } from './Field';
import { FormFeedback, type FeedbackLabels } from './FormFeedback';
import { Honeypot, errorText } from './FormParts';
import { SubmitButton } from './SubmitButton';

type Text = { label: string; hint: string };

export type ContactFormLabels = {
  title: string;
  required: string;
  submit: string;
  pending: string;
  honeypot: string;
  privacy: ReactNode;
  feedback: FeedbackLabels;
  errors: Record<string, string>;
  name: string;
  email: Text;
  message: Text;
};

/** Short message form: same action pattern and fallbacks as the brief, three fields. */
export function ContactForm({ locale, permalink, labels: L }: { locale: string; permalink: string; labels: ContactFormLabels }) {
  const [state, formAction] = useActionState(submitContact, initialFormState, permalink);
  const v = state.values;
  const err = (name: string) => errorText(L.errors, state.fieldErrors[name]?.[0]);
  const targets: [name: string, label: string][] = [
    ['name', L.name],
    ['email', L.email.label],
    ['message', L.message.label],
  ];
  const items = targets
    .filter(([name]) => state.fieldErrors[name])
    .map(([name, label]) => ({ name, id: `contact-${name}`, anchor: `contact-${name}-field`, label, message: err(name) ?? '' }));

  return (
    <form id="contact-form" action={formAction} noValidate aria-labelledby="contact-form-title" className="relative min-w-0">
      <h2 id="contact-form-title" className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">
        {L.title}
      </h2>
      <input type="hidden" name="locale" value={locale} />
      <FormFeedback state={state} items={items} labels={L.feedback} className="mt-8" />
      <div className="mt-8 flex flex-col gap-9">
        <Field id="contact-name" name="name" label={L.name} required={L.required}
          autoComplete="name" maxLength={120} defaultValue={v.name} error={err('name')} />
        <Field id="contact-email" name="email" type="email" inputMode="email" label={L.email.label} hint={L.email.hint}
          required={L.required} autoComplete="email" maxLength={200} defaultValue={v.email} error={err('email')} />
        <Field id="contact-message" name="message" label={L.message.label} hint={L.message.hint} required={L.required}
          rows={7} maxLength={3000} defaultValue={v.message} error={err('message')} />
      </div>
      <Honeypot id="contact-hp-extra" label={L.honeypot} />
      <div className="mt-10 flex flex-col items-start gap-6 border-t border-line pt-10">
        <SubmitButton label={L.submit} pendingLabel={L.pending} />
        <p className="max-w-[52ch] text-[13.5px] leading-[1.6] text-faint">{L.privacy}</p>
      </div>
    </form>
  );
}
