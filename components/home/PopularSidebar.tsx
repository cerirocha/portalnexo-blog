import { ArticleCard } from '@/components/article/ArticleCard';
import { Article } from '@/types/content';

interface PopularSidebarProps {
  articles: Article[];
}

export function PopularSidebar({ articles }: PopularSidebarProps) {
  return (
    <aside className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Más leídos</h2>
        <span className="text-xs uppercase tracking-[0.16em] text-muted">Hoy</span>
      </div>
      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} compact />
        ))}
      </div>
    </aside>
  );
}
