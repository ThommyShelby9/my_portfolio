import { describe, expect, it } from 'vitest';
import fr from '../../messages/fr.json';
import en from '../../messages/en.json';
import {
  COMMANDS,
  complete,
  fill,
  lineText,
  parse,
  run,
  type Result,
  type TerminalContext,
  type TerminalMessages,
} from '@/components/terminal/commands';
import { emptyHistory, MAX_HISTORY, recall, record, type History } from '@/components/terminal/history';
import type { Locale } from '@/i18n/routing';

const NBSP = ' ';

function context(locale: Locale): TerminalContext {
  const messages = (locale === 'fr' ? fr : en).terminal.out as TerminalMessages;
  return {
    locale,
    messages,
    realisations: [
      { slug: 'ccns', title: 'CCNS Bénin' },
      { slug: 'it-opportunities-tracker', title: 'IT-Opportunities-Tracker' },
      { slug: 'tadagberhplus', title: 'TadagbeRhPlus' },
      { slug: 'ubbfy', title: 'Ubbfy' },
    ],
    explorations: [
      { slug: 'procom', title: 'Procom' },
      { slug: 'lecentre', title: 'Le Centre' },
    ],
    profile: { name: 'Rostel Panoumassi', role: 'Head of Engineering & Innovation', employer: 'KPS Groupe', years: 6, lead: 3 },
    cvPdf: locale === 'fr' ? '/cv/rostel-panoumassi-cv.pdf' : '/cv/rostel-panoumassi-cv-en.pdf',
  };
}

const FR = context('fr');
const EN = context('en');
const text = (r: Result) => r.output.map(lineText);

describe('parse and fill', () => {
  it('splits on any whitespace and ignores the edges', () => {
    expect(parse('  open   ubbfy  x ')).toEqual({ name: 'open', args: ['ubbfy', 'x'] });
    expect(parse('')).toEqual({ name: '', args: [] });
  });

  it('fills known placeholders and leaves the others', () => {
    expect(fill('{a} and {b}', { a: 1 })).toBe('1 and {b}');
  });
});

describe('run', () => {
  it('prints nothing for an empty line', () => {
    expect(run('   ', FR)).toEqual({ output: [] });
  });

  it('help lists every command, aligned, with its description', () => {
    const lines = text(run('help', FR));
    expect(lines[0]).toBe(`Commandes disponibles${NBSP}:`);
    const rows = lines.slice(1, 1 + COMMANDS.length);
    expect(rows.map((r) => r.trim().split(/\s{2,}/)[0])).toEqual([
      'help', 'whoami', 'ls', 'open <slug>', 'explorations', 'brief', 'contact', 'cv', 'lang fr|en', 'clear', 'exit',
    ]);
    // Every description starts in the same column.
    const starts = rows.map((r, i) => r.indexOf(FR.messages.help[COMMANDS[i]]));
    expect(new Set(starts).size).toBe(1);
    expect(text(run('help', EN))[0]).toBe('Available commands:');
    expect(text(run('help', EN))).toContain('  help          show this help');
  });

  it('whoami states the owner facts only', () => {
    expect(text(run('whoami', FR))).toEqual([
      'Rostel Panoumassi, ingénieur produit',
      'Head of Engineering & Innovation chez KPS Groupe',
      '6 ans d’expérience, dont 3 comme tech lead',
      'Cotonou, Bénin · UTC+1',
    ]);
    expect(text(run('whoami', EN))).toEqual([
      'Rostel Panoumassi, product engineer',
      'Head of Engineering & Innovation at KPS Groupe',
      '6 years of experience, 3 as tech lead',
      'Cotonou, Benin · UTC+1',
    ]);
  });

  it('ls lists the realisations as slug and title columns', () => {
    const lines = text(run('ls', FR));
    expect(lines.slice(0, 4)).toEqual([
      'ccns                      CCNS Bénin',
      'it-opportunities-tracker  IT-Opportunities-Tracker',
      'tadagberhplus             TadagbeRhPlus',
      'ubbfy                     Ubbfy',
    ]);
    expect(lines[5]).toBe('4 réalisations. Tapez open <slug> pour en lire une.');
    expect(text(run('ls', EN))[5]).toBe('4 projects. Type open <slug> to read one.');
    expect(run('ls', FR).action).toBeUndefined();
  });

  it('explorations lists the explorations, said to be self-initiated', () => {
    const lines = text(run('explorations', FR));
    expect(lines.slice(0, 2)).toEqual(['procom    Procom', 'lecentre  Le Centre']);
    expect(lines[3]).toContain('de ma propre initiative, pas des réalisations livrées');
    expect(text(run('explorations', EN))[3]).toContain('not delivered work');
  });

  it('open goes to a case study or an exploration, localized', () => {
    expect(run('open ubbfy', FR)).toEqual({ output: [[{ text: 'ouverture de /realisations/ubbfy…', tone: 'muted' }]], action: { navigate: '/realisations/ubbfy' } });
    expect(run('open ubbfy', EN).action).toEqual({ navigate: '/en/work/ubbfy' });
    expect(run('open procom', FR).action).toEqual({ navigate: '/explorations/procom' });
    expect(run('open procom', EN).action).toEqual({ navigate: '/en/explorations/procom' });
    expect(run('OPEN Ubbfy', FR).action).toEqual({ navigate: '/realisations/ubbfy' });
  });

  it('open explains its usage and rejects an unknown slug', () => {
    expect(text(run('open', FR))).toEqual([`usage${NBSP}: open <slug>. Tapez ls ou explorations pour la liste.`]);
    expect(run('open nope', FR)).toEqual({ output: [[{ text: `open${NBSP}: nope${NBSP}: introuvable. Tapez ls ou explorations pour la liste.` }]] });
    expect(text(run('open nope', EN))).toEqual(['open: nope: not found. Type ls or explorations for the list.']);
  });

  it('brief and contact open their localized page', () => {
    expect(run('brief', FR).action).toEqual({ navigate: '/brief' });
    expect(run('brief', EN).action).toEqual({ navigate: '/en/brief' });
    expect(run('contact', FR).action).toEqual({ navigate: '/contact' });
    expect(text(run('contact', EN))).toEqual(['opening /en/contact…']);
  });

  it('cv opens the PDF of the current language as a document', () => {
    expect(run('cv', FR).action).toEqual({ navigate: '/cv/rostel-panoumassi-cv.pdf', document: true });
    expect(run('cv', EN).action).toEqual({ navigate: '/cv/rostel-panoumassi-cv-en.pdf', document: true });
  });

  it('lang switches to the terminal in the other language', () => {
    expect(run('lang en', FR)).toEqual({ output: [[{ text: 'passage en anglais…', tone: 'muted' }]], action: { navigate: '/en/terminal', locale: 'en' } });
    expect(run('lang FR', EN).action).toEqual({ navigate: '/terminal', locale: 'fr' });
    expect(run('lang fr', FR)).toEqual({ output: [[{ text: 'Le site est déjà en français.' }]] });
    expect(text(run('lang en', EN))).toEqual(['The site is already in English.']);
    for (const bad of ['lang', 'lang de']) expect(text(run(bad, FR)), bad).toEqual([`usage${NBSP}: lang fr|en`]);
  });

  it('clear empties the screen', () => {
    expect(run('clear', FR)).toEqual({ output: [], action: { clear: true } });
  });

  it('exit logs out to the home page', () => {
    expect(run('exit', FR)).toEqual({ output: [[{ text: 'déconnexion', tone: 'muted' }]], action: { navigate: '/' } });
    expect(run('exit', EN).action).toEqual({ navigate: '/en' });
  });

  it('names an unknown command as typed', () => {
    expect(text(run('sudo rm -rf /', FR))).toEqual([`commande introuvable${NBSP}: sudo. Tapez help.`]);
    expect(text(run('Vim', EN))).toEqual(['command not found: Vim. Type help.']);
  });

  it('matches command names case-insensitively', () => {
    expect(run('Help', FR)).toEqual(run('help', FR));
  });
});

describe('complete', () => {
  it('completes a unique command and adds a space', () => {
    expect(complete('wh', FR)).toEqual({ value: 'whoami ', options: [] });
    expect(complete('  op', FR)).toEqual({ value: 'open ', options: [] });
  });

  it('extends to the common prefix, then lists the options', () => {
    expect(complete('c', FR)).toEqual({ value: 'c', options: ['contact', 'cv', 'clear'] });
    expect(complete('e', FR)).toEqual({ value: 'ex', options: [] });
    expect(complete('ex', FR)).toEqual({ value: 'ex', options: ['explorations', 'exit'] });
    expect(complete('exp', FR)).toEqual({ value: 'explorations ', options: [] });
  });

  it('completes the slugs of open, realisations and explorations alike', () => {
    expect(complete('open ub', FR)).toEqual({ value: 'open ubbfy ', options: [] });
    expect(complete('open pro', FR)).toEqual({ value: 'open procom ', options: [] });
    expect(complete('OPEN it', FR)).toEqual({ value: 'open it-opportunities-tracker ', options: [] });
    expect(complete('open ', FR).options).toEqual(['ccns', 'it-opportunities-tracker', 'lecentre', 'procom', 'tadagberhplus', 'ubbfy']);
  });

  it('completes the languages of lang', () => {
    expect(complete('lang e', FR)).toEqual({ value: 'lang en ', options: [] });
    expect(complete('lang ', FR).options).toEqual(['fr', 'en']);
  });

  it('does nothing when there is nothing to complete', () => {
    for (const input of ['', '   ', 'zz', 'ls ', 'open zz', 'open ubbfy ', 'whoami x', 'help ']) {
      expect(complete(input, FR), JSON.stringify(input)).toEqual({ value: input, options: [] });
    }
  });
});

describe('history', () => {
  const withRuns = (...commands: string[]): History => commands.reduce((h, c) => record(h, c), emptyHistory());

  it('keeps run commands, trimmed, without blanks or immediate repeats', () => {
    expect(withRuns(' ls ', '', 'ls', 'help', 'ls').entries).toEqual(['ls', 'help', 'ls']);
  });

  it('keeps the last entries only', () => {
    const h = withRuns(...Array.from({ length: MAX_HISTORY + 5 }, (_, i) => `c${i}`));
    expect(h.entries).toHaveLength(MAX_HISTORY);
    expect(h.entries[0]).toBe('c5');
  });

  it('walks back with up, stops at the oldest, and returns to the draft with down', () => {
    let h = withRuns('ls', 'help', 'whoami');
    let step = recall(h, 'up', 'draft');
    expect(step.value).toBe('whoami');
    step = recall(step.history, 'up', step.value);
    expect(step.value).toBe('help');
    step = recall(step.history, 'up', step.value);
    step = recall(step.history, 'up', step.value);
    expect(step.value).toBe('ls');
    step = recall(step.history, 'down', step.value);
    expect(step.value).toBe('help');
    step = recall(step.history, 'down', step.value);
    step = recall(step.history, 'down', step.value);
    expect(step.value).toBe('draft');
    expect(step.history.index).toBeNull();
    h = step.history;
    expect(recall(h, 'down', 'draft').value).toBe('draft');
  });

  it('leaves the line alone with no history', () => {
    expect(recall(emptyHistory(), 'up', 'x')).toEqual({ history: emptyHistory(), value: 'x' });
  });

  it('resets the walk after a command runs', () => {
    const h = recall(withRuns('ls', 'help'), 'up', '').history;
    expect(record(h, 'cv')).toEqual({ entries: ['ls', 'help', 'cv'], index: null, draft: '' });
  });
});

describe('owner facts', () => {
  it('whoami takes its years from OWNER', async () => {
    const { OWNER } = await import('@/lib/site');
    const ctx = { ...context('fr'), profile: { ...context('fr').profile, years: OWNER.yearsExperience, lead: OWNER.yearsLead } };
    expect(text(run('whoami', ctx))[2]).toBe(`${OWNER.yearsExperience} ans d’expérience, dont ${OWNER.yearsLead} comme tech lead`);
  });
});

describe('open never leaves the known slugs', () => {
  it.each(['//evil.com', '../a-propos', '%2e%2e', 'https://evil.com', '/realisations/ubbfy'])('refuses %s', (arg) => {
    const result = run(`open ${arg}`, context('fr'));
    expect(result.action).toBeUndefined();
  });
});
