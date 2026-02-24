import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(3).max(70),
  slug: z.string().min(3).max(90),
  description: z.string().min(20).max(220),
  order: z.number().int().min(0).max(50),
});

const paragraphSchema = z.object({
  id: z.string(),
  type: z.literal('paragraph'),
  text: z.string().min(1),
});

const headingSchema = z.object({
  id: z.string(),
  type: z.literal('heading'),
  text: z.string().min(1),
  level: z.union([z.literal(2), z.literal(3)]),
});

const listSchema = z.object({
  id: z.string(),
  type: z.literal('list'),
  style: z.union([z.literal('ordered'), z.literal('unordered')]),
  items: z.array(z.string().min(1)).min(1),
});

const quoteSchema = z.object({
  id: z.string(),
  type: z.literal('quote'),
  text: z.string().min(1),
  citation: z.string().optional(),
});

const imageSchema = z.object({
  id: z.string(),
  type: z.literal('image'),
  src: z.string().url(),
  alt: z.string().min(2),
  align: z.union([z.literal('left'), z.literal('center'), z.literal('right'), z.literal('wide')]),
  caption: z.string().optional(),
});

export const articleBlockSchema = z.discriminatedUnion('type', [
  paragraphSchema,
  headingSchema,
  listSchema,
  quoteSchema,
  imageSchema,
]);

export const articleSchema = z.object({
  title: z.string().min(8).max(130),
  slug: z.string().min(4).max(150),
  featuredImage: z.string().url(),
  gallery: z.array(z.string().url()).max(10),
  content: z.array(articleBlockSchema).min(2),
  authorName: z.string().min(3).max(80),
  authorRole: z.string().max(120).optional(),
  categoryId: z.string().min(1),
  categoryName: z.string().min(2),
  categorySlug: z.string().min(2),
  status: z.union([z.literal('draft'), z.literal('published')]),
  tags: z.array(z.string().min(2).max(30)).max(12),
  metaDescription: z.string().min(80).max(170),
  isFeatured: z.boolean(),
  popularityScore: z.number().int().min(0).max(1000000),
});
