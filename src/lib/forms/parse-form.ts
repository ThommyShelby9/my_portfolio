import type { z } from 'zod';

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: Record<string, string[]>; values: Record<string, string> };

/** Validate a FormData against a schema; error messages are message keys. */
export function parseForm<S extends z.ZodType>(schema: S, formData: FormData): ParseResult<z.output<S>> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') values[key] = value;
  }
  const result = schema.safeParse(values);
  if (result.success) return { ok: true, data: result.data };
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? '_form');
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return { ok: false, fieldErrors, values };
}
