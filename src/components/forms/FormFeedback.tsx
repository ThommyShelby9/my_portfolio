'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import type { FormState } from '@/lib/forms/form-state';
import { ErrorSummary, type SummaryItem } from './ErrorSummary';

export type FeedbackLabels = {
  summaryTitle: string;
  summaryText: string;
  /** Summary line for an error that no field link can point to. */
  summaryGeneric: string;
  rateLimited: ReactNode;
  failed: ReactNode;
};

/**
 * Top-of-form feedback: the error summary after a validation failure, or the form-level message
 * (rate limited, delivery failed) in a live region. After each submission handled on the client,
 * focus moves to whichever is shown; when the server renders the state (no JS), `autoFocus` does it.
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

  const unmapped = Object.keys(state.fieldErrors).some((name) => !items.some((item) => item.name === name));
  const message = state.status === 'failed' ? labels.failed : state.status === 'rate-limited' ? labels.rateLimited : null;
  return (
    <div className={`flex flex-col gap-6 ${state.status === 'idle' ? '' : className}`}>
      {state.status === 'invalid' && (
        <ErrorSummary
          ref={summary}
          title={labels.summaryTitle}
          text={labels.summaryText}
          items={items}
          generic={unmapped || items.length === 0 ? labels.summaryGeneric : undefined}
        />
      )}
      <div aria-live="polite" aria-atomic="true">
        {message && (
          <div
            ref={notice}
            tabIndex={-1}
            autoFocus
            className="scroll-mt-6 border border-champagne bg-obsidian-2 px-6 py-6 text-[15.5px] leading-[1.65] text-ivory outline-offset-4 md:px-8"
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
