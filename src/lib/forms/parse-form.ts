import type { z } from 'zod';

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: Record<string, string[]>; values: Record<string, string> };

/**
 * Validate a FormData against a schema; error messages are message keys.
 * `echoFields` limits which raw fields are echoed back in `values` on failure.
 */
export function parseForm<S extends z.ZodType>(schema: S, formData: FormData,
  echoFields?: readonly string[],
): ParseResult<z.output<S>> {
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') raw[key] = value;
  }
  const result = schema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? '_form');
    (fieldErrors[key] ??= []).push(issue.message);
  }
  // Echo back only the allow-listed fields (never the honeypot or $ACTION_* keys).
  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!echoFields || echoFields.includes(key)) values[key] = value;
  }
  return { ok: false, fieldErrors, values };
}
