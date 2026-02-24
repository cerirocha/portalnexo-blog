import { ArticleCard } from '@/components/article/ArticleCard';
import { Article } from '@/types/content';

interface LatestGridProps {
  articles: Article[];
}

export function LatestGrid({ articles }: LatestGridProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="section-subtitle">Actualidad</p>
        <h2 className="section-title mt-1">Articulos recientes</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
