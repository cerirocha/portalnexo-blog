import Image from 'next/image';
import Link from 'next/link';

import { formatArticleDate } from '@/lib/utils';
import { Article } from '@/types/content';

interface HeroFeaturedProps {
  article: Article | null;
}

export function HeroFeatured({ article }: HeroFeaturedProps) {
  if (!article) {
    return (
      <section className="card-surface animate-rise p-8">
        <p className="section-subtitle">Destacado</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-5xl">Aún no hay artículo destacado</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Publica un artículo con la opción destacado para activar el hero principal de portada.
        </p>
      </section>
    );
  }

  return (
    <section className="card-surface animate-rise overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1.12fr_1fr]">
        <Link href={`/articulo/${article.slug}`} className="group relative block min-h-[320px] overflow-hidden">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition duration-700 group-hover:scale-[1.05]"
          />
        </Link>
        <div className="flex flex-col justify-between gap-6 p-7 md:p-10">
          <div className="space-y-4">
            <p className="section-subtitle">Artículo destacado</p>
            <Link href={`/articulo/${article.slug}`}>
              <h1 className="text-balance font-display text-4xl leading-[1.04] text-ink transition hover:text-brand md:text-5xl">
                {article.title}
              </h1>
            </Link>
            <p className="text-base leading-relaxed text-muted">{article.metaDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs uppercase tracking-[0.15em] text-muted">
            <span>{article.categoryName}</span>
            <span>{article.authorName}</span>
            <span>{formatArticleDate(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
