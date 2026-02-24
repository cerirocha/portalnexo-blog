import type { Metadata } from 'next';

import { siteConfig } from '@/lib/constants';

export function buildMetadata(params?: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const title = params?.title ? `${params.title} | ${siteConfig.name}` : siteConfig.name;
  const description = params?.description ?? siteConfig.description;
  const url = `${siteConfig.url}${params?.path ?? ''}`;
  const image = params?.image ?? `${siteConfig.url}${siteConfig.defaultOgImage}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: siteConfig.twitter,
    },
  };
}

export function buildArticleSchema(params: {
  title: string;
  description: string;
  image: string;
  publishedAt?: Date;
  modifiedAt?: Date;
  authorName: string;
  url: string;
  section: string;
  keywords: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    image: [params.image],
    datePublished: params.publishedAt?.toISOString(),
    dateModified: (params.modifiedAt ?? params.publishedAt)?.toISOString(),
    author: {
      '@type': 'Person',
      name: params.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.svg`,
      },
    },
    mainEntityOfPage: params.url,
    articleSection: params.section,
    keywords: params.keywords.join(', '),
  };
}
