/**
 * Choice values of the brief (they must match the enums in brief-schema.ts, a unit test checks it),
 * each paired with its message key under `brief.<field>.<key>`. Values such as `<1m` or `2-5`
 * are not valid message keys, hence the pairing.
 */
export const BRIEF_CHOICES = {
  projectType: [
    ['new', 'new'],
    ['revamp', 'revamp'],
    ['audit', 'audit'],
    ['spot', 'spot'],
    ['unsure', 'unsure'],
  ],
  currentState: [
    ['idea', 'idea'],
    ['design', 'design'],
    ['inProgressBlocked', 'inProgressBlocked'],
    ['mvpInProd', 'mvpInProd'],
    ['existingRevamp', 'existingRevamp'],
    ['auditOnly', 'auditOnly'],
  ],
  teamSize: [
    ['solo', 'solo'],
    ['2-5', 'small'],
    ['6-15', 'medium'],
    ['15+', 'large'],
  ],
  deadline: [
    ['<1m', 'lt1m'],
    ['1-3m', 'm1to3'],
    ['3-6m', 'm3to6'],
    ['flexible', 'flexible'],
  ],
  // 'undefined' is the explicit "not defined yet" answer; the schema turns it into no budget.
  budget: [
    ['<5k', 'lt5k'],
    ['5-15k', 'k5to15'],
    ['15-40k', 'k15to40'],
    ['40-100k', 'k40to100'],
    ['100k+', 'k100plus'],
    ['undefined', 'unknown'],
  ],
} as const satisfies Record<string, readonly (readonly [string, string])[]>;

/** Standalone checkboxes of the "already on the team" group. */
export const BRIEF_RESOURCES = ['hasTechTeam', 'hasDesigner', 'hasProductOwner'] as const;
