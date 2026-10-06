'use server';

import { contactFields, contactSchema } from '@/lib/forms/contact-schema';
import type { FormState } from '@/lib/forms/form-state';
import { submitForm } from '@/lib/server/submit-form';

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  return submitForm({ type: 'contact', schema: contactSchema, fields: contactFields, formData, thanks: '/contact/merci' });
}
