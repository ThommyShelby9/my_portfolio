import type { Locale } from '@/i18n/routing';
import { localizedPath } from '@/lib/i18n/localized-path';

/**
 * The terminal's shell, as pure functions: `run` turns a command line into output lines and an
 * optional action, `complete` does Tab completion. No DOM, no React: the component only renders.
 */

export const PROMPT = 'rostel@cotonou:~$';

export const COMMANDS = ['help', 'whoami', 'ls', 'open', 'explorations', 'brief', 'contact', 'cv', 'lang', 'clear', 'exit'] as const;
export type CommandName = (typeof COMMANDS)[number];

/** How each command is written in `help`. */
const USAGE: Record<CommandName, string> = {
  help: 'help',
  whoami: 'whoami',
  ls: 'ls',
  open: 'open <slug>',
  explorations: 'explorations',
  brief: 'brief',
  contact: 'contact',
  cv: 'cv',
  lang: 'lang fr|en',
  clear: 'clear',
  exit: 'exit',
};

/** The `terminal.out` messages of one locale (resolved on the server, passed as props). */
export type TerminalMessages = {
  welcome: string;
  helpTitle: string;
  helpKeys: string;
  help: Record<CommandName, string>;
  whoami: { identity: string; role: string; experience: string; location: string };
  ls: string;
  explorations: string;
  opening: string;
  openUsage: string;
  openUnknown: string;
  langUsage: string;
  langSame: string;
  langSwitch: string;
  unknown: string;
  exit: string;
};

export type Entry = { slug: string; title: string };

/** Everything a command may read. Serializable: built on the server at build time. */
export type TerminalContext = {
  locale: Locale;
  messages: TerminalMessages;
  realisations: Entry[];
  explorations: Entry[];
  /** `years` and `lead` fill the experience line (from OWNER, never written twice). */
  profile: { name: string; role: string; employer: string; years: number; lead: number };
  cvPdf: string;
};

export type Tone = 'muted' | 'accent';
/** A run of text. `col` makes it the first column of an aligned row, `col` characters wide. */
export type Span = { text: string; tone?: Tone; col?: number };
export type Line = Span[];

/**
 * What the page does after printing: go to a path (`document` for a full load, such as a PDF),
 * clear the screen. `locale` names the language a `lang` switch goes to.
 */
export type Action = { navigate?: string; document?: true; clear?: true; locale?: Locale };
export type Result = { output: Line[]; action?: Action };

const LOCALES: readonly Locale[] = ['fr', 'en'];

/** `{name}` placeholders, filled from `vars`; unknown ones are left as written. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

/** A line as plain text, columns padded with spaces (what a copy of the screen would read). */
export function lineText(line: Line): string {
  return line.map((s) => (s.col ? s.text.padEnd(s.col) : s.text)).join('');
}

const plain = (text: string): Line => [{ text }];
const muted = (text: string): Line => [{ text, tone: 'muted' }];

/** Aligned two-column rows: the first column is as wide as its longest cell plus two spaces. */
function table(rows: [string, string][], secondTone?: Tone): Line[] {
  const width = Math.max(...rows.map(([first]) => first.length)) + 2;
  return rows.map(([first, second]) => [{ text: first, col: width }, { text: second, tone: secondTone }]);
}

export function parse(input: string): { name: string; args: string[] } {
  const [name = '', ...args] = input.trim().split(/\s+/);
  return { name, args };
}

const isCommand = (name: string): name is CommandName => (COMMANDS as readonly string[]).includes(name);

function opening(path: string, ctx: TerminalContext): Line {
  return muted(fill(ctx.messages.opening, { path }));
}

function go(path: string, ctx: TerminalContext): Result {
  return { output: [opening(path, ctx)], action: { navigate: path } };
}

function help({ messages }: TerminalContext): Line[] {
  return [
    plain(messages.helpTitle),
    ...table(COMMANDS.map((c) => [`  ${USAGE[c]}`, messages.help[c]]), 'muted'),
    [],
    muted(messages.helpKeys),
  ];
}

function whoami({ messages, profile }: TerminalContext): Line[] {
  const w = messages.whoami;
  return [
    plain(fill(w.identity, { name: profile.name })),
    plain(fill(w.role, { role: profile.role, employer: profile.employer })),
    plain(fill(w.experience, { years: profile.years, lead: profile.lead })),
    muted(w.location),
  ];
}

function list(entries: Entry[], hint: string): Line[] {
  if (entries.length === 0) return [muted(fill(hint, { count: 0 }))];
  return [...table(entries.map((e) => [e.slug, e.title]), 'muted'), [], muted(fill(hint, { count: entries.length }))];
}

function open(args: string[], ctx: TerminalContext): Result {
  const { messages, locale } = ctx;
  const slug = args[0]?.toLowerCase();
  if (!slug) return { output: [plain(messages.openUsage)] };
  if (ctx.realisations.some((e) => e.slug === slug)) return go(localizedPath('/realisations/[slug]', locale, { slug }), ctx);
  if (ctx.explorations.some((e) => e.slug === slug)) return go(localizedPath('/explorations/[slug]', locale, { slug }), ctx);
  return { output: [plain(fill(messages.openUnknown, { slug: args[0] }))] };
}

function lang(args: string[], ctx: TerminalContext): Result {
  const { messages, locale } = ctx;
  const target = args[0]?.toLowerCase();
  if (!target || !(LOCALES as readonly string[]).includes(target)) return { output: [plain(messages.langUsage)] };
  if (target === locale) return { output: [plain(messages.langSame)] };
  const next = target as Locale;
  return { output: [muted(messages.langSwitch)], action: { navigate: localizedPath('/terminal', next), locale: next } };
}

/** Runs one command line. Command names are matched case-insensitively (phones capitalise). */
export function run(input: string, ctx: TerminalContext): Result {
  const { name, args } = parse(input);
  if (!name) return { output: [] };
  const command = name.toLowerCase();
  if (!isCommand(command)) return { output: [plain(fill(ctx.messages.unknown, { cmd: name }))] };
  const { messages, locale } = ctx;
  switch (command) {
    case 'help':
      return { output: help(ctx) };
    case 'whoami':
      return { output: whoami(ctx) };
    case 'ls':
      return { output: list(ctx.realisations, messages.ls) };
    case 'explorations':
      return { output: list(ctx.explorations, messages.explorations) };
    case 'open':
      return open(args, ctx);
    case 'brief':
      return go(localizedPath('/brief', locale), ctx);
    case 'contact':
      return go(localizedPath('/contact', locale), ctx);
    case 'cv':
      return { output: [opening(ctx.cvPdf, ctx)], action: { navigate: ctx.cvPdf, document: true } };
    case 'lang':
      return lang(args, ctx);
    case 'clear':
      return { output: [], action: { clear: true } };
    case 'exit':
      return { output: [muted(messages.exit)], action: { navigate: localizedPath('/', locale) } };
  }
}

function commonPrefix(words: string[]): string {
  let prefix = words[0] ?? '';
  for (const w of words) while (!w.startsWith(prefix)) prefix = prefix.slice(0, -1);
  return prefix;
}

/** What a word can complete to, knowing the command before it (none: completing the command). */
function candidates(command: string | null, ctx: TerminalContext): string[] {
  if (command === null) return [...COMMANDS];
  if (command === 'open') return [...new Set([...ctx.realisations, ...ctx.explorations].map((e) => e.slug))].sort();
  if (command === 'lang') return [...LOCALES];
  return [];
}

/**
 * Tab completion. A single match completes the word and adds a space; several matches extend
 * the word to their common prefix, or, when that adds nothing, come back as `options` to list.
 * Only the command and the first argument of `open` and `lang` complete.
 */
export function complete(input: string, ctx: TerminalContext): { value: string; options: string[] } {
  const none = { value: input, options: [] };
  const text = input.trimStart();
  if (!text) return none;
  const space = text.search(/\s/);
  let head = '';
  let word = text;
  let command: string | null = null;
  if (space >= 0) {
    command = text.slice(0, space).toLowerCase();
    word = text.slice(space).trimStart();
    if (/\s/.test(word)) return none;
    head = `${command} `;
  }
  const needle = word.toLowerCase();
  const matches = candidates(command, ctx).filter((c) => c.startsWith(needle));
  if (matches.length === 0) return none;
  if (matches.length === 1) return { value: `${head}${matches[0]} `, options: [] };
  const prefix = commonPrefix(matches);
  if (prefix.length > needle.length) return { value: `${head}${prefix}`, options: [] };
  return { value: input, options: matches };
}
