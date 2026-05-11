import { z } from 'zod'

export const projectTypeEnum = z.enum(['new', 'revamp', 'audit', 'spot', 'unsure'])
export const currentStateEnum = z.enum([
  'idea',
  'design',
  'inProgressBlocked',
  'mvpInProd',
  'existingRevamp',
  'auditOnly',
])
export const teamSizeEnum = z.enum(['solo', '2-5', '6-15', '15+'])
export const deadlineEnum = z.enum(['<1m', '1-3m', '3-6m', 'flexible'])
export const budgetEnum = z.enum(['<5k', '5-15k', '15-40k', '40-100k', '100k+', 'undefined'])
export const localeEnum = z.enum(['fr', 'en'])

const optionalNullableString = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform(v => (v === undefined || v === '' ? null : v))

const optionalNullableUrl = z
  .union([z.string().url(), z.literal('')])
  .nullable()
  .optional()
  .transform(v => (v === undefined || v === '' ? null : v))

export const briefSchema = z.object({
  projectType: projectTypeEnum,
  pitch: z.string().trim().min(10, 'Décris le projet en au moins 10 caractères').max(500),

  currentState: currentStateEnum,
  teamSize: teamSizeEnum,
  hasTechTeam: z.boolean().default(false),
  hasDesigner: z.boolean().default(false),
  hasProductOwner: z.boolean().default(false),
  notes: optionalNullableString,

  deadline: deadlineEnum,
  budget: budgetEnum,

  firstName: z.string().trim().min(1, 'Prénom requis').max(80),
  lastName: z.string().trim().min(1, 'Nom requis').max(80),
  email: z.string().trim().email('Email invalide').max(200),
  company: optionalNullableString,
  website: optionalNullableUrl,
  source: optionalNullableString,
  prefersCall: z.boolean().default(false),

  locale: localeEnum.default('fr'),
})

export type BriefInput = z.infer<typeof briefSchema>
