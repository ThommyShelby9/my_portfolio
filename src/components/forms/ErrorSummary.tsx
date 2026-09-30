'use client';

import type { MouseEvent, Ref } from 'react';

export type SummaryItem = {
  /** Form field name, as keyed in `fieldErrors`. */
  name: string;
  /** Control that receives focus (first option of a choice group). */
  id: string;
  /** Wrapper of the field (label, hint, error, control): the link target, scrolled to the top. */
  anchor: string;
  label: string;
  message: string;
};

type Props = {
  title: string;
  text: string;
  items: SummaryItem[];
  /** Shown when an error has no field to link to (a tampered hidden field, for instance). */
  generic?: string;
  ref?: Ref<HTMLDivElement>;
};

/**
 * Lets the link land on the whole field, so its label, hint and error sit under the sticky header
 * (the wrapper carries a scroll margin), then focuses the control without scrolling again.
 * Without JS the same link reaches the wrapper and Tab continues into the control.
 */
function goToField(event: MouseEvent<HTMLAnchorElement>, item: SummaryItem) {
  const control = document.getElementById(item.id);
  const field = document.getElementById(item.anchor);
  if (!control) return;
  event.preventDefault();
  (field ?? control).scrollIntoView({ block: 'start' });
  control.focus({ preventScroll: true });
}

/**
 * Lists every invalid field with a link to it. It receives focus after a failed submission: the form
 * moves it there on the client, and `autoFocus` does it when the server renders the error (no JS).
 */
export function ErrorSummary({ title, text, items, generic, ref }: Props) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      autoFocus
      role="group"
      aria-labelledby="error-summary-title"
      className="scroll-mt-6 border border-champagne bg-obsidian-2 px-6 py-7 outline-offset-4 md:px-8"
    >
      <h2 id="error-summary-title" className="font-serif text-[26px] font-medium leading-[1.2]">{title}</h2>
      <p className="mt-2 text-[14.5px] leading-[1.6] text-muted">{items.length > 0 ? text : generic}</p>
      {items.length > 0 && (
        <ul className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5">
          {items.map((item) => (
            <li key={item.id} className="text-[14.5px] leading-[1.5]">
              <a
                href={`#${item.anchor}`}
                onClick={(event) => goToField(event, item)}
                className="border-b border-champagne pb-0.5 font-medium text-ivory no-underline hover:text-champagne"
              >
                {item.label}
              </a>
              <span className="text-muted"> · {item.message}</span>
            </li>
          ))}
          {generic && <li className="text-[14.5px] leading-[1.5] text-muted">{generic}</li>}
        </ul>
      )}
    </div>
  );
}
