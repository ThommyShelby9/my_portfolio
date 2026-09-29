'use server';

import { briefFields, briefSchema } from '@/lib/forms/brief-schema';
import type { FormState } from '@/lib/forms/form-state';
import { submitForm } from '@/lib/server/submit-form';

export async function submitBrief(_prev: FormState, formData: FormData): Promise<FormState> {
  return submitForm({ type: 'brief', schema: briefSchema, fields: briefFields, formData, thanks: '/brief/merci' });
}
