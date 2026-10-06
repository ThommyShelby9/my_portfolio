'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { complete, lineText, PROMPT, run, type Line, type TerminalContext } from './commands';
import { emptyHistory, recall, record } from './history';

export type TerminalProps = {
  ctx: TerminalContext;
  labels: { input: string; output: string };
  /** Id of the visible key help, read with the input. */
  describedBy: string;
};

type Entry = { id: number; line: Line; echo?: boolean };

const TONE = { muted: 'text-muted', accent: 'text-signal' } as const;

function Row({ line, echo }: { line: Line; echo?: boolean }) {
  if (echo) {
    return (
      <p className="whitespace-pre-wrap">
        <span aria-hidden="true" className="text-signal">{PROMPT} </span>
        {lineText(line)}
      </p>
    );
  }
  const [first, ...rest] = line;
  if (first?.col) {
    // Aligned row: the second column starts at `col` characters when it fits on the line;
    // otherwise it wraps below with a hanging indent (the row's padding, cancelled for the first cell).
    return (
      <p className="flex flex-wrap whitespace-pre-wrap pl-[4ch]" style={{ '--col': `${first.col}ch` } as CSSProperties}>
        <span className={`-ml-[4ch] min-w-(--col) shrink-0 ${first.tone ? TONE[first.tone] : ''}`}>{first.text}</span>
        <span className="min-w-0">
          {rest.map((s, i) => <span key={i} className={s.tone ? TONE[s.tone] : undefined}>{s.text}</span>)}
        </span>
      </p>
    );
  }
  if (line.length === 0) return <p aria-hidden="true" className="h-[1lh]" />;
  return (
    <p className="whitespace-pre-wrap">
      {line.map((s, i) => <span key={i} className={s.tone ? TONE[s.tone] : undefined}>{s.text}</span>)}
    </p>
  );
}

/** The interactive shell. Loaded on the client only, from TerminalLoader. */
export function Terminal({ ctx, labels, describedBy }: TerminalProps) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const [entries, setEntries] = useState<Entry[]>(() => [{ id: 0, line: [{ text: ctx.messages.welcome, tone: 'muted' }] }]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState(emptyHistory);
  // The input for which Tab already listed the options: a second Tab then leaves the field.
  const [listedFor, setListedFor] = useState<string | null>(null);

  const append = (lines: Omit<Entry, 'id'>[]) =>
    setEntries((prev) => [...prev, ...lines.map((l) => ({ ...l, id: nextId.current++ }))]);

  // Single-purpose page: the prompt takes the focus as soon as the shell is there.
  useEffect(() => inputRef.current?.focus({ preventScroll: true }), []);

  useEffect(() => {
    const screen = screenRef.current;
    if (screen) screen.scrollTop = screen.scrollHeight;
  }, [entries]);

  const setInput = (next: string) => {
    setValue(next);
    setListedFor(null);
    // After a recall or a completion the caret goes to the end, as in a shell.
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(next.length, next.length));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const input = value;
    const { output, action } = run(input, ctx);
    setHistory((h) => record(h, input));
    setValue('');
    setListedFor(null);
    if (action?.clear) setEntries([]);
    else append([{ line: [{ text: input }], echo: true }, ...output.map((line) => ({ line }))]);
    if (action?.navigate) {
      if (action.document) window.location.assign(action.navigate);
      else router.push(action.navigate);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const step = recall(history, event.key === 'ArrowUp' ? 'up' : 'down', value);
      setHistory(step.history);
      setInput(step.value);
      return;
    }
    // Tab completes only when it has something to do; otherwise it moves the focus as usual.
    if (event.key === 'Tab' && !event.shiftKey) {
      const result = complete(value, ctx);
      if (result.value !== value) {
        event.preventDefault();
        setInput(result.value);
      } else if (result.options.length > 0 && listedFor !== value) {
        event.preventDefault();
        append([{ line: [{ text: value }], echo: true }, { line: [{ text: result.options.join('  ') }] }]);
        setListedFor(value);
      }
    }
  };

  // A click anywhere on the screen returns to the prompt, unless it selected text to copy.
  const focusPrompt = () => {
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={screenRef}
      onMouseUp={focusPrompt}
      className="h-full overflow-y-auto overscroll-contain px-4 py-4 font-mono text-[12.5px] leading-[1.7] text-ivory sm:px-6 sm:py-5 sm:text-[13.5px]"
    >
      <div role="log" aria-live="polite" aria-label={labels.output}>
        {entries.map((e) => <Row key={e.id} line={e.line} echo={e.echo} />)}
      </div>
      <form onSubmit={submit} className="group flex items-baseline gap-[1ch] border-b border-transparent focus-within:border-signal">
        <label htmlFor={inputId} className="shrink-0">
          <span className="sr-only">{labels.input}</span>
          <span aria-hidden="true" className="text-faint transition-colors group-focus-within:text-signal">{PROMPT}</span>
        </label>
        <input
          ref={inputRef}
          id={inputId}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setListedFor(null);
          }}
          onKeyDown={onKeyDown}
          aria-describedby={describedBy}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          maxLength={200}
          className="min-w-0 flex-1 bg-transparent p-0 text-ivory caret-signal outline-hidden"
        />
      </form>
    </div>
  );
}
