import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import slugify from 'slugify';

import { ArticleBlock } from '@/types/content';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatArticleDate(value?: Date) {
  if (!value) {
    return 'Actualizado';
  }

  return format(value, "dd 'de' MMM yyyy");
}

export function createSlug(value: string) {
  return slugify(value, {
    lower: true,
    strict: true,
    locale: 'es',
    trim: true,
  });
}

export function getPlainTextFromBlocks(blocks: ArticleBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === 'list') {
        return block.items.join(' ');
      }

      if (block.type === 'image') {
        return `${block.alt} ${block.caption ?? ''}`;
      }

      return block.text;
    })
    .join(' ')
    .trim();
}

export function estimateReadingMinutes(blocks: ArticleBlock[]) {
  const wordsPerMinute = 220;
  const text = getPlainTextFromBlocks(blocks);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
