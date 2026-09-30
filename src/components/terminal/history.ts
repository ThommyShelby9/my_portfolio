/**
 * Command history, as in a shell: ArrowUp walks back through past commands, ArrowDown walks
 * forward and ends on the line being typed before the walk (`draft`). Pure: returns new state.
 */

export type History = {
  entries: string[];
  /** Position in `entries` while walking, null when editing a new line. */
  index: number | null;
  draft: string;
};

export const MAX_HISTORY = 50;

export const emptyHistory = (): History => ({ entries: [], index: null, draft: '' });

/** Adds a run command: blank lines and an immediate repeat are not kept; the walk resets. */
export function record(history: History, command: string, max = MAX_HISTORY): History {
  const line = command.trim();
  const { entries } = history;
  const next = !line || entries[entries.length - 1] === line ? entries : [...entries, line].slice(-max);
  return { entries: next, index: null, draft: '' };
}

/** One step up (older) or down (newer). `current` is the input's value when the step starts. */
export function recall(history: History, direction: 'up' | 'down', current: string): { history: History; value: string } {
  const { entries, index } = history;
  if (direction === 'up') {
    if (entries.length === 0) return { history, value: current };
    if (index === null) {
      const last = entries.length - 1;
      return { history: { entries, index: last, draft: current }, value: entries[last] };
    }
    const prev = Math.max(0, index - 1);
    return { history: { ...history, index: prev }, value: entries[prev] };
  }
  if (index === null) return { history, value: current };
  if (index < entries.length - 1) return { history: { ...history, index: index + 1 }, value: entries[index + 1] };
  return { history: { entries, index: null, draft: '' }, value: history.draft };
}
