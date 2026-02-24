import Image from 'next/image';
import Link from 'next/link';

import { formatArticleDate } from '@/lib/utils';
import { Article } from '@/types/content';

interface ArticleCardProps {
  article: Article;
  compact?: boolean;
}

export function ArticleCard({ article, compact = false }: ArticleCardProps) {
  if (compact) {
    return (
      <Link
        href={`/articulo/${article.slug}`}
        className="group flex items-start gap-3 rounded-xl border border-line/80 bg-white/80 p-3 transition hover:-translate-y-0.5 hover:shadow-card"
      >
        <Image
          src={article.featuredImage}
          alt={article.title}
          width={96}
          height={72}
          className="h-[72px] w-24 rounded-lg object-cover"
        />
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.15em] text-brand">{article.categoryName}</p>
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-ink group-hover:text-brand">
            {article.title}
          </h3>
          <p className="text-xs text-muted">{formatArticleDate(article.publishedAt)}</p>
        </div>
      </Link>
    );
  }

  return (
    <article className="group card-surface overflow-hidden transition hover:-translate-y-1">
      <Link href={`/articulo/${article.slug}`} className="block overflow-hidden">
        <Image
          src={article.featuredImage}
          alt={article.title}
          width={900}
          height={540}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      </Link>
      <div className="space-y-4 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-brand">{article.categoryName}</p>
        <Link href={`/articulo/${article.slug}`}>
          <h3 className="line-clamp-2 text-balance font-display text-2xl leading-tight transition group-hover:text-brand">
            {article.title}
          </h3>
        </Link>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{article.metaDescription}</p>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{article.authorName}</span>
          <span>{formatArticleDate(article.publishedAt)}</span>
        </div>
      </div>
    </article>
  );
}
