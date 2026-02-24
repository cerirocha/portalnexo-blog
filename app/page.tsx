import { AdSlot } from '@/components/ads/AdSlot';
import { CategorySection } from '@/components/home/CategorySection';
import { HeroFeatured } from '@/components/home/HeroFeatured';
import { LatestGrid } from '@/components/home/LatestGrid';
import { PopularSidebar } from '@/components/home/PopularSidebar';
import { siteConfig } from '@/lib/constants';
import { buildMetadata } from '@/lib/seo';
import {
  getFeaturedArticle,
  getHomepageSections,
  getLatestArticles,
  getPopularArticles,
} from '@/services/publicContentService';

export const metadata = buildMetadata({
  title: 'Portal Nexo | Finanzas, inversiones y economía',
  description:
    'Noticias, análisis y guías sobre finanzas personales, inversiones, tarjetas de crédito, préstamos y economía.',
  path: '/',
});

export const revalidate = siteConfig.revalidateSeconds;

export default async function HomePage() {
  const [featured, latest, popular, sections] = await Promise.all([
    getFeaturedArticle(),
    getLatestArticles(9),
    getPopularArticles(5),
    getHomepageSections(3),
  ]);

  const latestWithoutFeatured = featured
    ? latest.filter((article) => article.id !== featured.id)
    : latest;

  return (
    <div className="container-shell space-y-14 pb-16 pt-8 md:pt-10">
      <HeroFeatured article={featured} />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <LatestGrid articles={latestWithoutFeatured} />
        <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <PopularSidebar articles={popular} />
          <AdSlot slot="home-sidebar" className="card-surface p-4" />
        </div>
      </div>

      {sections.map((section) => (
        <CategorySection key={section.category.id} category={section.category} articles={section.items} />
      ))}

      <section className="card-surface p-6 md:p-10">
        <p className="section-subtitle">Publicidad</p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl">Zona premium para patrocinadores</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Este bloque está preparado para incluir campañas de marca, afiliados y anuncios directos de alto CPM.
        </p>
        <AdSlot slot="home-bottom" className="mt-6" />
      </section>
    </div>
  );
}

