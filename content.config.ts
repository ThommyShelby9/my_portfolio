import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const workSchema = z.object({
  // Identity
  slug: z.string(),
  title: z.string(),
  kicker: z.string(),
  excerpt: z.string(),
  // Sorting
  year: z.number().int(),
  order: z.number().int().default(99),
  featured: z.boolean().default(false),

  // Meta
  client: z.string(),
  sector: z.string(),
  role: z.string(),
  team: z.string(),
  duration: z.string(),
  stack: z.array(z.string()),

  // Results — 1 to 3 entries
  results: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
    })
  ).min(1).max(3),

  // Media
  cover: z.string().optional(),

  // SEO
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
})

export default defineContentConfig({
  collections: {
    work: defineCollection({
      type: 'page',
      source: '**/work/*.md',
      schema: workSchema,
    }),
    pages: defineCollection({
      type: 'page',
      source: '**/{about,approach,contact}.md',
      schema: pageSchema,
    }),
  },
})
