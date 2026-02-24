import Link from 'next/link';

import { ArticleCard } from '@/components/article/ArticleCard';
import { Category, Article } from '@/types/content';

interface CategorySectionProps {
  category: Category;
  articles: Article[];
}

export function CategorySection({ category, articles }: CategorySectionProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="section-subtitle">Categoría</p>
          <h2 className="section-title mt-1">{category.name}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">{category.description}</p>
        </div>
        <Link
          href={`/categoria/${category.slug}`}
          className="text-xs font-semibold uppercase tracking-[0.16em] text-brand hover:text-ink"
        >
          Ver más
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
