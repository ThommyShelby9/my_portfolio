/** The six genes of the Digital DNA (spec §4.1, §5.4). Labels and proofs arrive in Lot 2. */
export const GENES = ['engineering', 'product', 'architecture', 'innovation', 'devops', 'leadership'] as const;
export type Gene = (typeof GENES)[number];

/** Base pairs, in scene order: pair 0 is the top third of the helix, pair 2 the bottom third. */
export const PAIRS = [
  ['engineering', 'product'],
  ['architecture', 'innovation'],
  ['devops', 'leadership'],
] as const satisfies readonly (readonly [Gene, Gene])[];
