import { ArticleCard } from '@/components/article/ArticleCard';
import { Article } from '@/types/content';

interface RelatedArticlesProps {
  articles: Article[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 space-y-6 border-t border-line/80 pt-10">
      <div>
        <p className="section-subtitle">Te puede interesar</p>
        <h2 className="section-title mt-1">Artículos relacionados</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
