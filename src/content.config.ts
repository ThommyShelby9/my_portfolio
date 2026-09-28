import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { makeWorkSchema } from './content/schemas';

const works = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/works' }),
  schema: ({ image }) => makeWorkSchema(image()),
});

export const collections = { works };
