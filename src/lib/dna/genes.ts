/** The six genes of the Digital DNA (spec §4.1, §5.4). */
export const GENES = ['engineering', 'product', 'architecture', 'innovation', 'devops', 'leadership'] as const;
export type Gene = (typeof GENES)[number];

/** Base pairs, in scene order: pair 0 is the top third of the helix, pair 2 the bottom third. */
export const PAIRS = [
  ['engineering', 'product'],
  ['architecture', 'innovation'],
  ['devops', 'leadership'],
] as const satisfies readonly (readonly [Gene, Gene])[];

type Locale = 'fr' | 'en';
type Localized<T> = Record<Locale, T>;

/** Gene names as shown in the interface (mono, uppercase in CSS). */
export const GENE_LABEL: Localized<Record<Gene, string>> = {
  fr: {
    engineering: 'Engineering',
    product: 'Product',
    architecture: 'Architecture',
    innovation: 'Innovation',
    devops: 'DevOps',
    leadership: 'Leadership',
  },
  en: {
    engineering: 'Engineering',
    product: 'Product',
    architecture: 'Architecture',
    innovation: 'Innovation',
    devops: 'DevOps',
    leadership: 'Leadership',
  },
};

export interface PairCopy { statement: string; proofs: string[] }

/**
 * What each pair means and the facts that back it. Every proof comes from a verified source
 * (content files, cv-data, owner facts); nothing here may introduce a new figure.
 */
export const PAIR_COPY: Localized<[PairCopy, PairCopy, PairCopy]> = {
  fr: [
    {
      statement: 'Je construis le produit, pas seulement le code : chaque choix technique sert un usage réel.',
      proofs: [
        'Ubbfy : un ERP refondu autour d’une seule API Django, servie au web, à une PWA et à une application Flutter de pointage.',
        'ZenLife, conçu et développé seul : planning, budget, messagerie et rappels, sur le web et le mobile.',
        'TadagbeRhPlus : −85 % de saisie manuelle pour un cabinet de conseil RH.',
      ],
    },
    {
      statement: 'Je fixe la structure avant la première ligne, et je garde de la place pour ce qui n’existe pas encore.',
      proofs: [
        'ContractIQ, SaaS d’analyse de contrats par IA co-construit avec Jérémie Zitti : Gemini avec repli OpenAI, plusieurs organisations.',
        'Les choix d’architecture structurants sont documentés : le contexte, les options, la décision.',
        'Des refontes proposées à des marques avant toute commande, présentées comme telles dans le laboratoire.',
      ],
    },
    {
      statement: 'Je livre jusqu’en production, et j’emmène l’équipe avec moi.',
      proofs: [
        'Déploiements conteneurisés avec Docker sur Coolify, ce site compris.',
        'Head of Engineering & Innovation chez KPS Groupe : encadrement des équipes, méthodes Agile et DevOps.',
        'TadagbeRhPlus : 3 mises à jour réglementaires CNSS livrées sans aucune régression.',
      ],
    },
  ],
  en: [
    {
      statement: 'I build the product, not just the code: every technical choice serves a real use.',
      proofs: [
        'Ubbfy: an ERP rebuilt around a single Django API, serving the web, a PWA and a Flutter time-tracking app.',
        'ZenLife, designed and built alone: planning, budget, messaging and reminders, on the web and on mobile.',
        'TadagbeRhPlus: 85 % less manual data entry for an HR consultancy.',
      ],
    },
    {
      statement: 'I set the structure before the first line, and I leave room for what does not exist yet.',
      proofs: [
        'ContractIQ, an AI contract analysis SaaS co-built with Jérémie Zitti: Gemini with an OpenAI fallback, several organisations.',
        'Structural architecture decisions are written down: the context, the options, the decision.',
        'Redesigns offered to brands before any order, presented as such in the lab.',
      ],
    },
    {
      statement: 'I ship all the way to production, and I bring the team with me.',
      proofs: [
        'Containerised deployments with Docker on Coolify, this site included.',
        'Head of Engineering & Innovation at KPS Groupe: team leadership, Agile and DevOps practices.',
        'TadagbeRhPlus: 3 regulatory CNSS updates shipped with zero regressions.',
      ],
    },
  ],
};

export interface BuildStep { name: string; text: string }

/** The Architect sequence of scene 02, top layer first (spec §4.1). */
export const BUILD_STEPS: Localized<[BuildStep, BuildStep, BuildStep, BuildStep, BuildStep]> = {
  fr: [
    { name: 'Idée', text: 'Comprendre le problème, l’usage et ce qui existe déjà, avant de parler technique.' },
    { name: 'Architecture', text: 'Choisir la structure, les données et les intégrations, et documenter les décisions structurantes.' },
    { name: 'Développement', text: 'Livrer par incréments testés, avec des revues de code et une intégration continue.' },
    { name: 'Infrastructure', text: 'Conteneuriser, automatiser les déploiements et surveiller ce qui tourne.' },
    { name: 'Production', text: 'Mettre en ligne, mesurer, corriger, puis faire évoluer le produit avec ses utilisateurs.' },
  ],
  en: [
    { name: 'Idea', text: 'Understand the problem, the use and what already exists, before talking technology.' },
    { name: 'Architecture', text: 'Choose the structure, the data and the integrations, and write down the structural decisions.' },
    { name: 'Development', text: 'Ship in tested increments, with code reviews and continuous integration.' },
    { name: 'Infrastructure', text: 'Containerise, automate deployments and watch what runs.' },
    { name: 'Production', text: 'Go live, measure, fix, then grow the product with its users.' },
  ],
};
