import { FieldError, FieldLabel, hintClass, labelClass } from './Field';

export type Choice = {
  /** Radio: the shared group name. Checkbox: the name of this checkbox. */
  name: string;
  /** Radio: the enum value. Checkbox: 'on'. */
  value: string;
  label: string;
  checked: boolean;
};

type Props = {
  /** Prefix of the option ids: `${id}-0` is the target of the error summary link. */
  id: string;
  type: 'radio' | 'checkbox';
  legend: string;
  choices: Choice[];
  required?: string;
  hint?: string;
  error?: string;
};

/**
 * Native radios or checkboxes styled as rectangular chips. The input stays in the accessibility tree
 * (visually hidden, not display:none) and drives the chip through `peer` states: keyboard focus draws the
 * champagne ring on the chip, checked turns it ivory with obsidian text.
 */
export function ChoiceGroup({ id, type, legend, choices, required, hint, error }: Props) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset aria-describedby={describedBy} className="min-w-0">
      <legend className={labelClass}>
        <FieldLabel required={required}>{legend}</FieldLabel>
      </legend>
      {hint && <p id={hintId} className={hintClass}>{hint}</p>}
      {error && errorId && <FieldError id={errorId}>{error}</FieldError>}
      <div className="mt-3.5 flex flex-wrap gap-2.5">
        {choices.map((c, i) => (
          <label key={`${c.name}-${c.value}`} className="relative flex max-w-full cursor-pointer">
            <input
              id={`${id}-${i}`}
              type={type}
              name={c.name}
              value={c.value}
              defaultChecked={c.checked}
              required={type === 'radio' && Boolean(required)}
              aria-invalid={error && type === 'radio' ? true : undefined}
              className="peer sr-only"
            />
            <span
              className={
                'flex min-h-11 items-center gap-2.5 rounded-[2px] border px-4 py-2.5 text-[14.5px] leading-[1.35] text-ivory ' +
                'transition-colors hover:border-ivory ' +
                'peer-checked:border-ivory peer-checked:bg-ivory peer-checked:text-obsidian ' +
                'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-champagne peer-focus-visible:outline-solid ' +
                (error ? 'border-champagne' : 'border-edge')
              }
            >
              {type === 'checkbox' && (
                // Multi-select cue: an open square that fills when checked.
                <span aria-hidden="true" className="size-[9px] shrink-0 border border-current [input:checked+span>&]:bg-current" />
              )}
              {c.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
