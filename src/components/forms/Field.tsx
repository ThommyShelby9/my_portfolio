import type { ReactNode } from 'react';

/** Label line shared by text fields and choice groups: the question, then the required marker in words. */
export function FieldLabel({ children, required }: { children: ReactNode; required?: string }) {
  return (
    <>
      {children}
      {required && (
        // The control carries `required` for assistive tech; the word is for sighted visitors.
        <span aria-hidden="true" className="ml-3 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-faint">
          {required}
        </span>
      )}
    </>
  );
}

export const labelClass = 'block text-[15px] font-medium leading-[1.45] text-ivory';
export const hintClass = 'mt-1.5 max-w-[60ch] text-[13.5px] leading-[1.6] text-faint';
export const errorClass = 'mt-2 flex items-start gap-2.5 text-[14px] font-medium leading-[1.5] text-champagne';

/** Field-level error, placed above the control so it is read before the input. */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className={errorClass}>
      <span aria-hidden="true" className="mt-[7px] size-[6px] shrink-0 bg-champagne" />
      <span>{children}</span>
    </p>
  );
}

const controlBase =
  'mt-3 block w-full rounded-[2px] border bg-obsidian-2 px-4 py-3.5 text-[16px] leading-[1.5] text-ivory ' +
  'transition-colors placeholder:text-faint hover:border-muted focus:border-champagne';

type Props = {
  id: string;
  name: string;
  label: string;
  /** Visible "required" word; its presence also makes the control required. */
  required?: string;
  hint?: string;
  error?: string;
  defaultValue?: string;
  type?: 'text' | 'email' | 'url';
  autoComplete?: string;
  maxLength?: number;
  /** Renders a textarea with this many rows. */
  rows?: number;
  inputMode?: 'text' | 'email' | 'url';
  /** Example format only, never a substitute for the label. */
  placeholder?: string;
};

/** Text input or textarea with a visible label, an optional hint and an error bound by aria-describedby. */
export function Field({ id, name, label, required, hint, error, defaultValue, type = 'text', autoComplete, maxLength, rows, inputMode, placeholder }: Props) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  const common = {
    id,
    name,
    required: Boolean(required),
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    defaultValue,
    maxLength,
    autoComplete,
    placeholder,
    className: `${controlBase} ${error ? 'border-champagne' : 'border-edge'}`,
  } as const;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        <FieldLabel required={required}>{label}</FieldLabel>
      </label>
      {hint && <p id={hintId} className={hintClass}>{hint}</p>}
      {error && errorId && <FieldError id={errorId}>{error}</FieldError>}
      {rows ? (
        <textarea {...common} rows={rows} className={`${common.className} min-h-32 resize-y`} />
      ) : (
        <input {...common} type={type} inputMode={inputMode} spellCheck={type === 'text' ? undefined : false} />
      )}
    </div>
  );
}
