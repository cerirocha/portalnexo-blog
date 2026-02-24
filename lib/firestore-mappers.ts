import { Timestamp } from 'firebase-admin/firestore';

import { Article, Category } from '@/types/content';

type RawDate = Date | Timestamp | null | undefined;

function toDate(value: RawDate) {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value;
  }

  return value.toDate();
}

export function mapCategory(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    name: String(data.name ?? ''),
    slug: String(data.slug ?? ''),
    description: String(data.description ?? ''),
    order: Number(data.order ?? 0),
    createdAt: toDate(data.createdAt as RawDate),
    updatedAt: toDate(data.updatedAt as RawDate),
  };
}

export function mapArticle(id: string, data: Record<string, unknown>): Article {
  return {
    id,
    title: String(data.title ?? ''),
    slug: String(data.slug ?? ''),
    featuredImage: String(data.featuredImage ?? ''),
    gallery: (data.gallery as string[] | undefined) ?? [],
    content: (data.content as Article['content'] | undefined) ?? [],
    authorName: String(data.authorName ?? ''),
    authorRole: data.authorRole ? String(data.authorRole) : undefined,
    categoryId: String(data.categoryId ?? ''),
    categoryName: String(data.categoryName ?? ''),
    categorySlug: String(data.categorySlug ?? ''),
    status: (data.status as Article['status']) ?? 'draft',
    tags: (data.tags as string[] | undefined) ?? [],
    metaDescription: String(data.metaDescription ?? ''),
    isFeatured: Boolean(data.isFeatured),
    popularityScore: Number(data.popularityScore ?? 0),
    publishedAt: toDate(data.publishedAt as RawDate),
    createdAt: toDate(data.createdAt as RawDate),
    updatedAt: toDate(data.updatedAt as RawDate),
  };
}
