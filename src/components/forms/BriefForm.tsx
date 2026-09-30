'use client';

import { useActionState, type ReactNode } from 'react';
import { submitBrief } from '@/app/[locale]/brief/actions';
import { initialFormState } from '@/lib/forms/form-state';
import { ChoiceGroup, type Choice } from './ChoiceGroup';
import { Field } from './Field';
import { FormFeedback, type FeedbackLabels } from './FormFeedback';
import { FormSection, Honeypot, errorText } from './FormParts';
import { SubmitButton } from './SubmitButton';

type Option = { value: string; label: string };
type Choices = { label: string; options: Option[] };
type Text = { label: string; hint: string };
type Section = { legend: string; text: string };

export type BriefFormLabels = {
  formLabel: string;
  required: string;
  submit: string;
  pending: string;
  honeypot: string;
  privacy: ReactNode;
  feedback: FeedbackLabels;
  /** `errors.*` dictionary: the action returns keys, the client shows text. */
  errors: Record<string, string>;
  sections: { project: Section; context: Section; frame: Section; you: Section };
  projectType: Choices;
  pitch: Text;
  currentState: Choices;
  teamSize: Choices;
  resources: { label: string; options: { name: string; label: string }[] };
  notes: Text;
  deadline: Choices;
  budget: Choices & { hint: string };
  firstName: string;
  lastName: string;
  email: Text;
  company: string;
  website: { label: string; placeholder: string };
  source: string;
  firstContact: string;
  prefersCall: string;
};

const GRID = 'lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-x-16';

/** The project brief. Server action + useActionState: it works without JS and keeps every answer on error. */
export function BriefForm({ locale, permalink, labels: L }: { locale: string; permalink: string; labels: BriefFormLabels }) {
  const [state, formAction] = useActionState(submitBrief, initialFormState, permalink);
  const v = state.values;
  const err = (name: string) => errorText(L.errors, state.fieldErrors[name]?.[0]);
  const radios = (name: string, options: Option[]): Choice[] =>
    options.map((o) => ({ name, value: o.value, label: o.label, checked: v[name] === o.value }));
  const checkboxes = (options: { name: string; label: string }[]): Choice[] =>
    options.map((o) => ({ name: o.name, value: 'on', label: o.label, checked: v[o.name] === 'on' }));

  // Error summary targets, in form order. Links land on the field wrapper (`brief-<name>-field`);
  // focus goes to the control, or to the first option of a choice group.
  const targets: [name: string, label: string, group?: 'group'][] = [
    ['projectType', L.projectType.label, 'group'],
    ['pitch', L.pitch.label],
    ['currentState', L.currentState.label, 'group'],
    ['teamSize', L.teamSize.label, 'group'],
    ['notes', L.notes.label],
    ['deadline', L.deadline.label, 'group'],
    ['budget', L.budget.label, 'group'],
    ['firstName', L.firstName],
    ['lastName', L.lastName],
    ['email', L.email.label],
    ['company', L.company],
    ['website', L.website.label],
    ['source', L.source],
  ];
  const items = targets
    .filter(([name]) => state.fieldErrors[name])
    .map(([name, label, group]) => ({
      name,
      id: group ? `brief-${name}-0` : `brief-${name}`,
      anchor: `brief-${name}-field`,
      label,
      message: err(name) ?? '',
    }));

  return (
    <form
      id="brief-form"
      action={formAction}
      noValidate
      aria-label={L.formLabel}
      className="relative mx-auto max-w-[1280px] px-5 pb-[14vh] md:px-10"
    >
      <input type="hidden" name="locale" value={locale} />
      <div className={`grid ${GRID}`}>
        <FormFeedback state={state} items={items} labels={L.feedback} className="pt-12 lg:col-start-2" />
      </div>

      <FormSection {...L.sections.project}>
        <ChoiceGroup id="brief-projectType" type="radio" legend={L.projectType.label} required={L.required}
          choices={radios('projectType', L.projectType.options)} error={err('projectType')} />
        <Field id="brief-pitch" name="pitch" label={L.pitch.label} hint={L.pitch.hint} required={L.required}
          rows={5} maxLength={1000} defaultValue={v.pitch} error={err('pitch')} />
      </FormSection>

      <FormSection {...L.sections.context}>
        <ChoiceGroup id="brief-currentState" type="radio" legend={L.currentState.label} required={L.required}
          choices={radios('currentState', L.currentState.options)} error={err('currentState')} />
        <ChoiceGroup id="brief-teamSize" type="radio" legend={L.teamSize.label} required={L.required}
          choices={radios('teamSize', L.teamSize.options)} error={err('teamSize')} />
        <ChoiceGroup id="brief-resources" type="checkbox" legend={L.resources.label} choices={checkboxes(L.resources.options)} />
        <Field id="brief-notes" name="notes" label={L.notes.label} hint={L.notes.hint}
          rows={4} maxLength={2000} defaultValue={v.notes} error={err('notes')} />
      </FormSection>

      <FormSection {...L.sections.frame}>
        <ChoiceGroup id="brief-deadline" type="radio" legend={L.deadline.label} required={L.required}
          choices={radios('deadline', L.deadline.options)} error={err('deadline')} />
        <ChoiceGroup id="brief-budget" type="radio" legend={L.budget.label} hint={L.budget.hint}
          choices={radios('budget', L.budget.options)} error={err('budget')} />
      </FormSection>

      <FormSection {...L.sections.you}>
        <div className="grid gap-10 md:grid-cols-2 md:gap-6">
          <Field id="brief-firstName" name="firstName" label={L.firstName} required={L.required}
            autoComplete="given-name" maxLength={80} defaultValue={v.firstName} error={err('firstName')} />
          <Field id="brief-lastName" name="lastName" label={L.lastName} required={L.required}
            autoComplete="family-name" maxLength={80} defaultValue={v.lastName} error={err('lastName')} />
        </div>
        <Field id="brief-email" name="email" type="email" inputMode="email" label={L.email.label} hint={L.email.hint}
          required={L.required} autoComplete="email" maxLength={200} defaultValue={v.email} error={err('email')} />
        <div className="grid gap-10 md:grid-cols-2 md:gap-6">
          <Field id="brief-company" name="company" label={L.company}
            autoComplete="organization" maxLength={120} defaultValue={v.company} error={err('company')} />
          <Field id="brief-website" name="website" type="url" inputMode="url" label={L.website.label} placeholder={L.website.placeholder}
            autoComplete="url" maxLength={300} defaultValue={v.website} error={err('website')} />
        </div>
        <Field id="brief-source" name="source" label={L.source} maxLength={200} defaultValue={v.source} error={err('source')} />
        <ChoiceGroup id="brief-prefersCall" type="checkbox" legend={L.firstContact}
          choices={checkboxes([{ name: 'prefersCall', label: L.prefersCall }])} />
      </FormSection>

      <Honeypot id="brief-hp-extra" label={L.honeypot} />

      <div className={`grid border-t border-line pt-12 ${GRID}`}>
        <div className="flex flex-col items-start gap-6 lg:col-start-2">
          <SubmitButton label={L.submit} pendingLabel={L.pending} />
          <p className="max-w-[52ch] text-[13.5px] leading-[1.6] text-faint">{L.privacy}</p>
        </div>
      </div>
    </form>
  );
}
