'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  getAdminArticles,
  getAdminCategories,
  signOutAdmin,
} from '@/services/adminService';
import { ArticleEditor } from '@/components/admin/ArticleEditor';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { Article, Category } from '@/types/content';

type AdminTab = 'articles' | 'categories';

export function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAdminAuth();

  const [tab, setTab] = useState<AdminTab>('articles');
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  const refreshData = useCallback(async () => {
    if (!isAdmin) {
      return;
    }

    setLoadingData(true);
    setError('');

    try {
      const [nextCategories, nextArticles] = await Promise.all([
        getAdminCategories(),
        getAdminArticles(),
      ]);
      setCategories(nextCategories);
      setArticles(nextArticles);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el panel');
    } finally {
      setLoadingData(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/admin/login');
    }
  }, [loading, isAdmin, router]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const summary = useMemo(
    () => [
      { label: 'Categorías', value: categories.length },
      { label: 'Artículos', value: articles.length },
      {
        label: 'Publicados',
        value: articles.filter((article) => article.status === 'published').length,
      },
    ],
    [articles, categories.length],
  );

  if (loading || !isAdmin) {
    return (
      <div className="container-shell py-14">
        <div className="card-surface flex min-h-[240px] items-center justify-center p-6 text-sm text-muted">
          Cargando panel...
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell space-y-8 pb-16 pt-10">
      <header className="card-surface space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-subtitle">Panel protegido</p>
            <h1 className="mt-1 font-display text-4xl">Administrador Portal Nexo</h1>
            <p className="mt-2 text-sm text-muted">Usuario: {user?.email ?? user?.uid}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await signOutAdmin();
              router.replace('/admin/login');
            }}
            className="rounded-full border border-line px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em]"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {summary.map((item) => (
            <div key={item.label} className="rounded-xl border border-line/80 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-muted">{item.label}</p>
              <p className="mt-2 font-display text-3xl">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('articles')}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] ${
              tab === 'articles' ? 'bg-brand text-white' : 'border border-line'
            }`}
          >
            Artículos
          </button>
          <button
            type="button"
            onClick={() => setTab('categories')}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] ${
              tab === 'categories' ? 'bg-brand text-white' : 'border border-line'
            }`}
          >
            Categorías
          </button>
        </div>
      </header>

      {loadingData ? (
        <div className="card-surface flex min-h-[220px] items-center justify-center p-6 text-sm text-muted">
          Cargando contenido del panel...
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {!loadingData && tab === 'categories' ? (
        <CategoryManager user={user} categories={categories} onChange={refreshData} />
      ) : null}

      {!loadingData && tab === 'articles' ? (
        <ArticleEditor user={user} categories={categories} articles={articles} onChange={refreshData} />
      ) : null}
    </div>
  );
}

