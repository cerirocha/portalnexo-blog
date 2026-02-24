import { notFound } from 'next/navigation';

import { ArticleCard } from '@/components/article/ArticleCard';
import { buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/constants';
import {
  getArticlesByCategory,
  getCategories,
  getCategoryBySlug,
} from '@/services/publicContentService';

interface CategoryPageProps {
  params: { slug: string };
}

export const revalidate = siteConfig.revalidateSeconds;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);

  if (!category) {
    return buildMetadata({
      title: 'Categoría no encontrada',
      path: `/categoria/${params.slug}`,
    });
  }

  return buildMetadata({
    title: category.name,
    description: category.description,
    path: `/categoria/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const articles = await getArticlesByCategory(category.slug, 24);

  return (
    <div className="container-shell space-y-8 pb-16 pt-10">
      <header className="card-surface p-8">
        <p className="section-subtitle">Categoría</p>
        <h1 className="mt-2 text-balance font-display text-4xl leading-tight md:text-5xl">{category.name}</h1>
        <p className="mt-3 max-w-3xl text-muted">{category.description}</p>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </section>
    </div>
  );
}
