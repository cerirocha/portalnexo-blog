export type ArticleStatus = 'draft' | 'published';

export type BlockType = 'paragraph' | 'heading' | 'list' | 'quote' | 'image';

interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  text: string;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  text: string;
  level: 2 | 3;
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  style: 'ordered' | 'unordered';
  items: string[];
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  text: string;
  citation?: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt: string;
  align: 'left' | 'center' | 'right' | 'wide';
  caption?: string;
}

export type ArticleBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | QuoteBlock
  | ImageBlock;

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  gallery: string[];
  content: ArticleBlock[];
  authorName: string;
  authorRole?: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  status: ArticleStatus;
  tags: string[];
  metaDescription: string;
  isFeatured: boolean;
  popularityScore: number;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ArticleInput extends Omit<Article, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}
