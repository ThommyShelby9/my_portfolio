import { z } from 'astro/zod';

export const proofSchema = z.object({
  text: z.string().trim().min(1),
  source: z.string().trim().min(1),
});

export const workStatus = z.enum(['live', 'archived', 'private']);
export type WorkStatus = z.infer<typeof workStatus>;

export function makeWorkSchema<T extends z.ZodType>(imageSchema: T) {
  return z
    .object({
      inventory: z.string().regex(/^RP-\d{4}-\d{2}$/),
      title: z.string().trim().min(1),
      summary: z.string().trim().min(1),
      year: z.number().int().min(2015).max(2100),
      role: z.string().trim().min(1),
      team: z.string().trim().min(1).optional(),
      duration: z.string().trim().min(1).optional(),
      materials: z.array(z.string().trim().min(1)).min(1),
      status: workStatus,
      liveUrl: z.url().optional(),
      githubUrl: z.url().optional(),
      room: z.number().int().min(1).max(4).nullable(),
      screenshots: z
        .array(
          z.object({
            src: imageSchema,
            alt: z.string().trim().min(1),
            kind: z.enum(['public', 'interior']),
          }),
        )
        .min(1),
      proofs: z.array(proofSchema).default([]),
      seoDescription: z.string().trim().min(1).max(170),
    })
    .superRefine((work, ctx) => {
      if (work.status === 'live' && !work.liveUrl) {
        ctx.addIssue({ code: 'custom', path: ['liveUrl'], message: 'liveUrl is required when status is live' });
      }
    });
}
