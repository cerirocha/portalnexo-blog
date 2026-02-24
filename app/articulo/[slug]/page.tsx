import Image from 'next/image';
import { notFound } from 'next/navigation';

import { AdSlot } from '@/components/ads/AdSlot';
import { ArticleBlocksRenderer } from '@/components/article/ArticleBlocksRenderer';
import { RelatedArticles } from '@/components/article/RelatedArticles';
import { buildArticleSchema, buildMetadata } from '@/lib/seo';
import { formatArticleDate } from '@/lib/utils';
import { siteConfig } from '@/lib/constants';
import {
  getArticleBySlug,
  getLatestArticles,
  getRelatedArticles,
} from '@/services/publicContentService';

interface ArticlePageProps {
  params: { slug: string };
}

export const revalidate = siteConfig.revalidateSeconds;

export async function generateStaticParams() {
  const articles = await getLatestArticles(200);
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return buildMetadata({
      title: 'Artículo no encontrado',
      path: `/articulo/${params.slug}`,
    });
  }

  return buildMetadata({
    title: article.title,
    description: article.metaDescription,
    path: `/articulo/${article.slug}`,
    image: article.featuredImage,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article, 3);

  const articleUrl = `${siteConfig.url}/articulo/${article.slug}`;

  const schema = buildArticleSchema({
    title: article.title,
    description: article.metaDescription,
    image: article.featuredImage,
    publishedAt: article.publishedAt,
    modifiedAt: article.updatedAt,
    authorName: article.authorName,
    url: articleUrl,
    section: article.categoryName,
    keywords: article.tags,
  });

  return (
    <div className="container-shell pb-20 pt-10">
      <article className="mx-auto max-w-4xl space-y-9">
        <header className="space-y-5">
          <p className="section-subtitle">{article.categoryName}</p>
          <h1 className="text-balance font-display text-4xl leading-tight text-ink md:text-6xl">{article.title}</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted">{article.metaDescription}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.15em] text-muted">
            <span>{article.authorName}</span>
            <span>{formatArticleDate(article.publishedAt)}</span>
            {article.authorRole ? <span>{article.authorRole}</span> : null}
          </div>
        </header>

        <figure className="overflow-hidden rounded-3xl">
          <Image
            src={article.featuredImage}
            alt={article.title}
            width={1400}
            height={820}
            priority
            className="h-auto w-full object-cover"
          />
        </figure>

        <AdSlot slot="article-top" className="card-surface p-3" />

        <ArticleBlocksRenderer blocks={article.content} />

        {article.gallery.length > 0 ? (
          <section className="space-y-4">
            <h2 className="font-display text-3xl">Galería</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {article.gallery.map((image, index) => (
                <Image
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${article.title} galería ${index + 1}`}
                  width={900}
                  height={620}
                  loading="lazy"
                  className="h-64 w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </section>
        ) : null}

        {article.tags.length > 0 ? (
          <section className="flex flex-wrap gap-2 border-t border-line/70 pt-6">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-brand/20 bg-brandSoft px-3 py-1 text-xs font-medium text-brand"
              >
                #{tag}
              </span>
            ))}
          </section>
        ) : null}

        <RelatedArticles articles={relatedArticles} />
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </div>
  );
}
