import Image from 'next/image';

import { cn } from '@/lib/utils';
import { ArticleBlock } from '@/types/content';

interface ArticleBlocksRendererProps {
  blocks: ArticleBlock[];
}

export function ArticleBlocksRenderer({ blocks }: ArticleBlocksRendererProps) {
  return (
    <div className="space-y-6 text-base leading-relaxed text-[#22261c]">
      {blocks.map((block) => {
        if (block.type === 'paragraph') {
          return (
            <p key={block.id} className="text-lg leading-8 text-[#22261c]">
              {block.text}
            </p>
          );
        }

        if (block.type === 'heading') {
          return block.level === 2 ? (
            <h2 key={block.id} className="mt-10 text-3xl leading-tight text-ink">
              {block.text}
            </h2>
          ) : (
            <h3 key={block.id} className="mt-8 text-2xl leading-tight text-ink">
              {block.text}
            </h3>
          );
        }

        if (block.type === 'list') {
          const ListTag = block.style === 'ordered' ? 'ol' : 'ul';
          return (
            <ListTag
              key={block.id}
              className={cn(
                'space-y-2 pl-6 text-lg leading-8 text-[#22261c]',
                block.style === 'ordered' ? 'list-decimal' : 'list-disc',
              )}
            >
              {block.items.map((item, index) => (
                <li key={`${block.id}-${index}`}>{item}</li>
              ))}
            </ListTag>
          );
        }

        if (block.type === 'quote') {
          return (
            <blockquote key={block.id} className="rounded-r-2xl border-l-4 border-accent bg-[#f4efe4] px-6 py-5">
              <p className="font-display text-2xl italic leading-relaxed text-ink">“{block.text}”</p>
              {block.citation ? (
                <cite className="mt-3 block text-xs uppercase tracking-[0.16em] text-muted">{block.citation}</cite>
              ) : null}
            </blockquote>
          );
        }

        return (
          <figure
            key={block.id}
            className={cn('space-y-2', {
              'mr-auto max-w-xl': block.align === 'left',
              'mx-auto max-w-2xl': block.align === 'center',
              'ml-auto max-w-xl': block.align === 'right',
              'mx-auto max-w-4xl': block.align === 'wide',
            })}
          >
            <Image
              src={block.src}
              alt={block.alt}
              width={1200}
              height={680}
              className="w-full rounded-2xl object-cover"
            />
            {block.caption ? <figcaption className="text-sm text-muted">{block.caption}</figcaption> : null}
          </figure>
        );
      })}
    </div>
  );
}
