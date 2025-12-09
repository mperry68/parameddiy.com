import { defineCollection, z } from 'astro:content';
import { categories, type Category } from '../config';

const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    category: z.enum(categories as [Category, ...Category[]]),
    tags: z.array(z.string()),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    readingTime: z.number().optional(),
    featured: z.boolean().optional().default(false),
  }),
});

export const collections = {
  articles: articlesCollection,
};

