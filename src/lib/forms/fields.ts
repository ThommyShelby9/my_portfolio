import { z } from 'zod';

export const REQUIRED = 'errors.required';
export const TOO_LONG = 'errors.tooLong';

export const localeEnum = z.enum(['fr', 'en'], { error: REQUIRED });

/** Required trimmed text, 1..max. */
export const requiredText = (max: number) =>
  z.string({ error: REQUIRED }).trim().min(1, REQUIRED).max(max, TOO_LONG);

export const emailField = z
  .string({ error: 'errors.invalidEmail' })
  .trim()
  .max(200, TOO_LONG)
  .pipe(z.email('errors.invalidEmail'));

const blankToUndefined = (v: unknown) =>
  v == null || (typeof v === 'string' && v.trim() === '') ? undefined : v;

export const optionalText = (max: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max, TOO_LONG).optional());

const isHttpUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export const optionalUrl = z.preprocess(
  blankToUndefined,
  z.string().trim().max(300, TOO_LONG).refine(isHttpUrl, 'errors.invalidUrl').optional(),
);

/** HTML checkbox: 'on' (or 'true') is true, absent is false. */
export const checkbox = z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean());
