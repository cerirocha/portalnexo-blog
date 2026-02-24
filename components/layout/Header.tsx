import Link from 'next/link';

import { createSlug } from '@/lib/utils';
import { navCategoriesFallback } from '@/lib/constants';
import { getCategories } from '@/services/publicContentService';

export async function Header() {
  const categories = await getCategories();

  const navigation =
    categories.length > 0
      ? categories.map((category) => ({ name: category.name, slug: category.slug }))
      : navCategoriesFallback.map((name) => ({ name, slug: createSlug(name) }));

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/95 backdrop-blur">
      <div className="container-shell">
        <div className="flex min-h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-end gap-2">
            <span className="font-display text-3xl leading-none tracking-tight text-ink">Portal Nexo</span>
            <span className="mb-1 rounded-full bg-brandSoft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
              digital
            </span>
          </Link>
          <div className="hidden flex-1 justify-center lg:flex">
            <nav className="flex items-center gap-6 text-sm font-medium text-ink/85">
              {navigation.map((item) => (
                <Link
                  key={item.slug}
                  href={`/categoria/${item.slug}`}
                  className="border-b border-transparent pb-1 transition hover:border-brand hover:text-brand"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-brand px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-brand transition hover:bg-brand hover:text-white"
            >
              Admin
            </Link>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 lg:hidden">
          {navigation.map((item) => (
            <Link
              key={item.slug}
              href={`/categoria/${item.slug}`}
              className="whitespace-nowrap rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

