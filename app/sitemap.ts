import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/constants';
import { getCategories, getLatestArticles } from '@/services/publicContentService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, articles] = await Promise.all([getCategories(), getLatestArticles(1000)]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteConfig.url}/categoria/${category.slug}`,
    lastModified: category.updatedAt ?? new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteConfig.url}/articulo/${article.slug}`,
    lastModified: article.updatedAt ?? article.publishedAt ?? new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
