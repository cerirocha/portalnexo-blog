import 'server-only';

import { unstable_cache } from 'next/cache';

import { siteConfig } from '@/lib/constants';
import { mapArticle, mapCategory } from '@/lib/firestore-mappers';
import { getAdminDb } from '@/lib/firebase/admin';
import { Article, Category } from '@/types/content';

async function withFallback<T>(runner: () => Promise<T>, fallback: T) {
  try {
    return await runner();
  } catch (error) {
    console.error('Content service error:', error);
    return fallback;
  }
}

const getCategoriesCached = unstable_cache(
  async (): Promise<Category[]> => {
    const snapshot = await getAdminDb().collection('categories').orderBy('order', 'asc').get();
    return snapshot.docs.map((doc) => mapCategory(doc.id, doc.data()));
  },
  ['categories-list'],
  { revalidate: siteConfig.revalidateSeconds, tags: ['categories'] },
);

const getLatestArticlesCached = unstable_cache(
  async (limit: number): Promise<Article[]> => {
    const snapshot = await getAdminDb()
      .collection('articles')
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => mapArticle(doc.id, doc.data()));
  },
  ['articles-latest'],
  { revalidate: siteConfig.revalidateSeconds, tags: ['articles'] },
);

const getPopularArticlesCached = unstable_cache(
  async (limit: number): Promise<Article[]> => {
    const snapshot = await getAdminDb()
      .collection('articles')
      .where('status', '==', 'published')
      .orderBy('popularityScore', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => mapArticle(doc.id, doc.data()));
  },
  ['articles-popular'],
  { revalidate: siteConfig.revalidateSeconds, tags: ['articles'] },
);

const getFeaturedArticleCached = unstable_cache(
  async (): Promise<Article | null> => {
    const snapshot = await getAdminDb()
      .collection('articles')
      .where('status', '==', 'published')
      .where('isFeatured', '==', true)
      .orderBy('publishedAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const document = snapshot.docs[0];
    return mapArticle(document.id, document.data());
  },
  ['article-featured'],
  { revalidate: siteConfig.revalidateSeconds, tags: ['articles'] },
);

const getArticleBySlugCached = unstable_cache(
  async (slug: string): Promise<Article | null> => {
    const snapshot = await getAdminDb()
      .collection('articles')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const document = snapshot.docs[0];
    return mapArticle(document.id, document.data());
  },
  ['article-by-slug'],
  { revalidate: siteConfig.revalidateSeconds, tags: ['articles'] },
);

const getArticlesByCategoryCached = unstable_cache(
  async (slug: string, limit: number): Promise<Article[]> => {
    const snapshot = await getAdminDb()
      .collection('articles')
      .where('status', '==', 'published')
      .where('categorySlug', '==', slug)
      .orderBy('publishedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => mapArticle(doc.id, doc.data()));
  },
  ['articles-by-category'],
  { revalidate: siteConfig.revalidateSeconds, tags: ['articles', 'categories'] },
);

const getDraftOrPublishedArticleCached = unstable_cache(
  async (slug: string): Promise<Article | null> => {
    const snapshot = await getAdminDb().collection('articles').where('slug', '==', slug).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const document = snapshot.docs[0];
    return mapArticle(document.id, document.data());
  },
  ['article-by-slug-any-status'],
  { revalidate: siteConfig.revalidateSeconds, tags: ['articles'] },
);

export async function getCategories() {
  return withFallback(() => getCategoriesCached(), [] as Category[]);
}

export async function getFeaturedArticle() {
  return withFallback(() => getFeaturedArticleCached(), null);
}

export async function getLatestArticles(limit = 12) {
  return withFallback(() => getLatestArticlesCached(limit), [] as Article[]);
}

export async function getPopularArticles(limit = 6) {
  return withFallback(() => getPopularArticlesCached(limit), [] as Article[]);
}

export async function getArticleBySlug(slug: string, includeDraft = false) {
  if (includeDraft) {
    return withFallback(() => getDraftOrPublishedArticleCached(slug), null);
  }

  return withFallback(() => getArticleBySlugCached(slug), null);
}

export async function getArticlesByCategory(slug: string, limit = 9) {
  return withFallback(() => getArticlesByCategoryCached(slug, limit), [] as Article[]);
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getRelatedArticles(article: Article, limit = 3) {
  const articles = await getArticlesByCategory(article.categorySlug, limit + 1);
  return articles.filter((item) => item.id !== article.id).slice(0, limit);
}

export async function getHomepageSections(maxSections = 3) {
  const categories = await getCategories();
  const sections: Array<{ category: Category; items: Article[] }> = [];

  for (const category of categories) {
    const items = await getArticlesByCategory(category.slug, 4);

    if (items.length === 0) {
      continue;
    }

    sections.push({ category, items });

    if (sections.length >= maxSections) {
      break;
    }
  }

  return sections;
}
