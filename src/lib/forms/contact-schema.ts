import { z } from 'zod';
import { emailField, localeEnum, requiredText } from './fields';

export const contactSchema = z.object({
  name: requiredText(120),
  email: emailField,
  message: z
    .string({ error: 'errors.messageTooShort' })
    .trim()
    .min(10, 'errors.messageTooShort')
    .max(3000, 'errors.messageTooLong'),
  locale: localeEnum,
});

export type ContactInput = z.output<typeof contactSchema>;
