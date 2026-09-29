'use client';

import { useFormStatus } from 'react-dom';
import { buttonClassName } from '@/components/site/ButtonLink';

/** Primary submit with a pending state; disabled while the action runs so a brief is never sent twice. */
export function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      data-button
      disabled={pending}
      className={`${buttonClassName('primary')} cursor-pointer disabled:cursor-wait disabled:bg-muted`}
    >
      {pending ? pendingLabel : label}
      {pending ? (
        <span aria-hidden="true" className="inline-flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-[4px] animate-pulse bg-current" style={{ animationDelay: `${i * 160}ms` }} />
          ))}
        </span>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false" className="transition-transform group-hover:translate-x-0.5">
          <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      )}
    </button>
  );
}
