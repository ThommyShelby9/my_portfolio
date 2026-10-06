/**
 * State shared by the brief and contact server actions and their forms (`useActionState`).
 * `fieldErrors` holds message keys (`errors.*`); `values` echoes the allow-listed raw input so
 * both the no-JS re-render and the client re-render keep what the visitor typed.
 */
export type FormStatus = 'idle' | 'invalid' | 'rate-limited' | 'failed';

export interface FormState {
  status: FormStatus;
  fieldErrors: Record<string, string[]>;
  values: Record<string, string>;
}

export const initialFormState: FormState = { status: 'idle', fieldErrors: {}, values: {} };
