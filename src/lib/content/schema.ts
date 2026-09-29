import { z } from 'zod';

export type ProjectKind = 'realisation' | 'exploration';

export const STATUSES = ['live', 'archived', 'private', 'concept'] as const;

/** How an exploration reached its subject: made on Rostel's own initiative, or also presented to the client. */
export const PROPOSALS = ['unsolicited', 'pitched'] as const;
export type Proposal = (typeof PROPOSALS)[number];

const image = z.object({
  src: z.string().regex(/^\/work\/[a-z0-9-]+\/\d{2}\.webp$/, 'image src must be /work/<slug>/NN.webp'),
  alt: z.string().min(1),
  kind: z.enum(['public', 'interior']).default('public'),
});

const proof = z.object({ text: z.string().min(1), source: z.string().min(1) });

const base = z.object({
  title: z.string().min(1),
  summary: z.string().min(1).max(220),
  year: z.number().int().min(2015).max(2100),
  duration: z.string().min(1).optional(),
  role: z.string().min(1),
  team: z.string().min(1).optional(),
  coauthors: z.array(z.string().min(1)).default([]),
  stack: z.array(z.string().min(1)).min(1),
  status: z.enum(STATUSES),
  liveUrl: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
  featured: z.number().int().min(1).max(3).nullable().default(null),
  order: z.number().int(),
  client: z.string().min(1).optional(),
  sector: z.string().min(1).optional(),
  images: z.array(image),
  proofs: z.array(proof).default([]),
  proposal: z.enum(PROPOSALS).optional(),
  seoDescription: z.string().min(1).max(170),
}).strict();

export type Frontmatter = z.infer<typeof base>;

export function frontmatterSchema(kind: ProjectKind) {
  return base.superRefine((d, ctx) => {
    if (d.status === 'live' && !d.liveUrl) {
      ctx.addIssue({ code: 'custom', path: ['liveUrl'], message: 'status live requires liveUrl' });
    }
    if (kind === 'exploration') {
      if (d.status !== 'concept') {
        ctx.addIssue({ code: 'custom', path: ['status'], message: 'exploration requires status concept' });
      }
      if (d.featured !== null) {
        ctx.addIssue({ code: 'custom', path: ['featured'], message: 'exploration cannot be featured' });
      }
      // An exploration is not client work: no live product to link, no client to name.
      if (d.liveUrl !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['liveUrl'], message: 'exploration cannot have a liveUrl' });
      }
      if (d.client !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['client'], message: 'exploration cannot have a client' });
      }
      if (d.proofs.length > 0) {
        ctx.addIssue({ code: 'custom', path: ['proofs'], message: 'exploration cannot have proofs' });
      }
    } else if (d.proposal !== undefined) {
      ctx.addIssue({ code: 'custom', path: ['proposal'], message: 'proposal is only allowed on explorations' });
    }
  }).transform((d) => (kind === 'exploration' ? { ...d, proposal: d.proposal ?? ('unsolicited' as const) } : d));
}

export function parseFrontmatter(kind: ProjectKind, data: unknown) {
  return frontmatterSchema(kind).safeParse(data);
}
