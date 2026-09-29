import { useEffect, useRef, type ReactNode } from 'react';
import type { FormState } from '@/lib/forms/form-state';
import { ErrorSummary, type SummaryItem } from './ErrorSummary';

/**
 * Anti-spam trap. Moved off-screen (not display:none, which some bots detect), out of the tab order,
 * hidden from assistive tech, never autofilled. A filled value makes the server fake a success.
 */
export function Honeypot({ id, label }: { id: string; label: string }) {
  return (
    <div aria-hidden="true" className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" name="nickname" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}

export type FeedbackLabels = {
  summaryTitle: string;
  summaryText: string;
  rateLimited: ReactNode;
  failed: ReactNode;
};

/**
 * Top-of-form feedback: the error summary after a validation failure, or the form-level message
 * (rate limited, delivery failed) in a live region. After each submission handled on the client,
 * focus moves to whichever is shown; without JS the page reloads on the form anchor instead.
 */
export function FormFeedback({
  state,
  items,
  labels,
  className = '',
}: {
  state: FormState;
  items: SummaryItem[];
  labels: FeedbackLabels;
  /** Applied only while there is something to show, so an idle form keeps its rhythm. */
  className?: string;
}) {
  const summary = useRef<HTMLDivElement>(null);
  const notice = useRef<HTMLDivElement>(null);
  const seen = useRef(state);

  useEffect(() => {
    // Only a new state moves focus: hydrating a page rendered with an error state (no-JS reload) does not.
    if (seen.current === state) return;
    seen.current = state;
    (state.status === 'invalid' ? summary.current : notice.current)?.focus();
  }, [state]);

  const message = state.status === 'failed' ? labels.failed : state.status === 'rate-limited' ? labels.rateLimited : null;
  return (
    <div className={`flex flex-col gap-6 ${state.status === 'idle' ? '' : className}`}>
      {state.status === 'invalid' && items.length > 0 && (
        <ErrorSummary ref={summary} title={labels.summaryTitle} text={labels.summaryText} items={items} />
      )}
      <div aria-live="polite" aria-atomic="true">
        {message && (
          <div
            ref={notice}
            tabIndex={-1}
            className="border border-champagne bg-obsidian-2 px-6 py-6 text-[15.5px] leading-[1.65] text-ivory outline-offset-4 md:px-8"
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

/** One numbered part of a form: legend and a short line on the left, the questions on the right. */
export function FormSection({ legend, text, children }: { legend: string; text: string; children: ReactNode }) {
  return (
    <fieldset className="grid min-w-0 gap-y-3 border-t border-line py-12 first-of-type:border-t-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:py-16">
      {/* float removes the legend's special fieldset rendering so it can sit in the grid (HTML rendering spec). */}
      <legend className="float-left font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne lg:col-start-1 lg:row-start-1">
        {legend}
      </legend>
      <p className="max-w-[26ch] font-serif text-[24px] font-medium leading-[1.25] text-muted lg:col-start-1 lg:row-start-2">{text}</p>
      <div className="mt-7 flex min-w-0 flex-col gap-10 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">{children}</div>
    </fieldset>
  );
}

/** Message key (`errors.required`) to its text, from the dictionary the server passed down. */
export function errorText(dict: Record<string, string>, key: string | undefined): string | undefined {
  if (!key) return undefined;
  return dict[key.replace(/^errors\./, '')] ?? dict.required;
}
