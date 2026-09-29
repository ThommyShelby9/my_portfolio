import type { Ref } from 'react';

export type SummaryItem = { id: string; label: string; message: string };

type Props = { title: string; text: string; items: SummaryItem[]; ref?: Ref<HTMLDivElement> };

/**
 * Lists every invalid field with a link to it. It receives focus after a failed submission
 * (the form moves it there), so it is focusable with tabIndex -1 and labelled by its title.
 */
export function ErrorSummary({ title, text, items, ref }: Props) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="group"
      aria-labelledby="error-summary-title"
      className="border border-champagne bg-obsidian-2 px-6 py-7 outline-offset-4 md:px-8"
    >
      <h2 id="error-summary-title" className="font-serif text-[26px] font-medium leading-[1.2]">{title}</h2>
      <p className="mt-2 text-[14.5px] leading-[1.6] text-muted">{text}</p>
      <ul className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5">
        {items.map((item) => (
          <li key={item.id} className="text-[14.5px] leading-[1.5]">
            <a href={`#${item.id}`} className="border-b border-champagne pb-0.5 font-medium text-ivory no-underline hover:text-champagne">
              {item.label}
            </a>
            <span className="text-muted"> · {item.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
