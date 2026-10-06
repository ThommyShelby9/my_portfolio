import { z } from 'zod';
import { checkbox, localeEnum, optionalText, optionalUrl, emailField, requiredText, REQUIRED } from './fields';

const e = (values: [string, ...string[]]) => z.enum(values, { error: REQUIRED });

export const briefSchema = z.object({
  projectType: e(['new', 'revamp', 'audit', 'spot', 'unsure']),
  pitch: z
    .string({ error: 'errors.pitchTooShort' })
    .trim()
    .min(10, 'errors.pitchTooShort')
    .max(1000, 'errors.pitchTooLong'),

  currentState: e(['idea', 'design', 'inProgressBlocked', 'mvpInProd', 'existingRevamp', 'auditOnly']),
  teamSize: e(['solo', '2-5', '6-15', '15+']),
  hasTechTeam: checkbox,
  hasDesigner: checkbox,
  hasProductOwner: checkbox,
  notes: optionalText(2000),

  deadline: e(['<1m', '1-3m', '3-6m', 'flexible']),
  budget: z.preprocess(
    (v) => (v == null || v === '' || v === 'undefined' ? undefined : v),
    e(['<5k', '5-15k', '15-40k', '40-100k', '100k+']).optional(),
  ),

  firstName: requiredText(80),
  lastName: requiredText(80),
  email: emailField,
  company: optionalText(120),
  website: optionalUrl,
  source: optionalText(200),
  prefersCall: checkbox,

  locale: localeEnum,
});

/** Known form field names, used as the echo allow-list for parseForm. */
export const briefFields = Object.keys(briefSchema.shape);

export type BriefInput = z.output<typeof briefSchema>;
