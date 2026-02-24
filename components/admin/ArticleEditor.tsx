'use client';

import Image from 'next/image';
import { User } from 'firebase/auth';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';

import { ArticleBlocksRenderer } from '@/components/article/ArticleBlocksRenderer';
import { createSlug } from '@/lib/utils';
import {
  deleteArticleById,
  saveArticle,
  uploadArticleImage,
} from '@/services/adminService';
import { Article, ArticleBlock, ArticleInput, Category } from '@/types/content';

interface ArticleEditorProps {
  user: User | null;
  categories: Category[];
  articles: Article[];
  onChange: () => Promise<void>;
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildEmptyArticle(category?: Category): ArticleInput {
  return {
    title: '',
    slug: '',
    featuredImage: '',
    gallery: [],
    content: [
      {
        id: makeId(),
        type: 'paragraph',
        text: '',
      },
      {
        id: makeId(),
        type: 'paragraph',
        text: '',
      },
    ],
    authorName: '',
    authorRole: '',
    categoryId: category?.id ?? '',
    categoryName: category?.name ?? '',
    categorySlug: category?.slug ?? '',
    status: 'draft',
    tags: [],
    metaDescription: '',
    isFeatured: false,
    popularityScore: 0,
  };
}

export function ArticleEditor({ user, categories, articles, onChange }: ArticleEditorProps) {
  const [form, setForm] = useState<ArticleInput>(() => buildEmptyArticle(categories[0]));
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === form.categoryId) ?? categories[0],
    [categories, form.categoryId],
  );

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      categorySlug: selectedCategory.slug,
    }));
  }, [selectedCategory]);

  const handleNewArticle = () => {
    setForm(buildEmptyArticle(categories[0]));
    setTagsInput('');
    setError('');
  };

  const handleLoadArticle = (article: Article) => {
    setForm({ ...article, id: article.id });
    setTagsInput(article.tags.join(', '));
    setError('');
  };

  const handleFeaturedUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const url = await uploadArticleImage(file, 'featured');
      setForm((prev) => ({ ...prev, featuredImage: url }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No se pudo subir la imagen principal');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleGalleryUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => uploadArticleImage(file, 'gallery')),
      );

      setForm((prev) => ({ ...prev, gallery: [...prev.gallery, ...uploaded] }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No se pudo subir la galería');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleBlockUpdate = (blockId: string, next: Partial<ArticleBlock>) => {
    setForm((prev) => ({
      ...prev,
      content: prev.content.map((block) =>
        block.id === blockId ? ({ ...block, ...next } as ArticleBlock) : block,
      ),
    }));
  };

  const addBlock = (type: ArticleBlock['type']) => {
    const newBlock: ArticleBlock =
      type === 'paragraph'
        ? { id: makeId(), type: 'paragraph', text: '' }
        : type === 'heading'
          ? { id: makeId(), type: 'heading', text: '', level: 2 }
          : type === 'list'
            ? { id: makeId(), type: 'list', style: 'unordered', items: [''] }
            : type === 'quote'
              ? { id: makeId(), type: 'quote', text: '', citation: '' }
              : { id: makeId(), type: 'image', src: '', alt: '', align: 'center', caption: '' };

    setForm((prev) => ({ ...prev, content: [...prev.content, newBlock] }));
  };

  const removeBlock = (blockId: string) => {
    setForm((prev) => ({
      ...prev,
      content: prev.content.length > 1 ? prev.content.filter((block) => block.id !== blockId) : prev.content,
    }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload: ArticleInput = {
        ...form,
        slug: createSlug(form.slug || form.title),
        tags: tagsInput
          .split(',')
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean),
        categoryId: selectedCategory?.id ?? form.categoryId,
        categoryName: selectedCategory?.name ?? form.categoryName,
        categorySlug: selectedCategory?.slug ?? form.categorySlug,
      };

      const articleId = await saveArticle(user, payload);
      await onChange();

      if (!form.id) {
        setForm((prev) => ({ ...prev, id: articleId }));
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el artículo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id || !window.confirm('¿Eliminar este artículo permanentemente?')) {
      return;
    }

    try {
      await deleteArticleById(user, form.id);
      await onChange();
      handleNewArticle();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'No se pudo eliminar el artículo');
    }
  };

  return (
    <section className="space-y-6">
      <div className="card-surface space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-subtitle">Gestión editorial</p>
            <h2 className="mt-1 font-display text-3xl">Artículos</h2>
          </div>
          <button
            type="button"
            onClick={handleNewArticle}
            className="rounded-full border border-brand px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-brand"
          >
            Nuevo artículo
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <button
              key={article.id}
              type="button"
              onClick={() => handleLoadArticle(article)}
              className="rounded-xl border border-line/80 bg-white/80 p-3 text-left transition hover:border-brand"
            >
              <p className="line-clamp-2 font-semibold">{article.title}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.15em] text-muted">{article.status}</p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="card-surface space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.15em] text-muted">Título</span>
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                    slug: prev.id ? prev.slug : createSlug(event.target.value),
                  }))
                }
                className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.15em] text-muted">Slug SEO</span>
              <input
                required
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: createSlug(event.target.value) }))}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.15em] text-muted">Categoría</span>
              <select
                required
                value={form.categoryId}
                onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.15em] text-muted">Autor</span>
              <input
                required
                value={form.authorName}
                onChange={(event) => setForm((prev) => ({ ...prev, authorName: event.target.value }))}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.15em] text-muted">Rol autor</span>
              <input
                value={form.authorRole ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, authorRole: event.target.value }))}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.15em] text-muted">Meta description</span>
              <textarea
                required
                rows={3}
                value={form.metaDescription}
                onChange={(event) => setForm((prev) => ({ ...prev, metaDescription: event.target.value }))}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.15em] text-muted">Tags (separados por coma)</span>
              <input
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.15em] text-muted">Estado</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value as ArticleInput['status'] }))
                }
                className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.15em] text-muted">Popularidad (manual)</span>
              <input
                type="number"
                min={0}
                value={form.popularityScore}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, popularityScore: Number(event.target.value) || 0 }))
                }
                className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => setForm((prev) => ({ ...prev, isFeatured: event.target.checked }))}
                className="h-4 w-4 rounded border-line"
              />
              Marcar como destacado en portada
            </label>
          </div>

          <div className="space-y-3 border-t border-line/70 pt-5">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Imagen principal</p>
            <input
              required
              value={form.featuredImage}
              onChange={(event) => setForm((prev) => ({ ...prev, featuredImage: event.target.value }))}
              placeholder="https://..."
              className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
            />
            <input type="file" accept="image/*" onChange={handleFeaturedUpload} />
          </div>

          <div className="space-y-3 border-t border-line/70 pt-5">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Galería opcional</p>
            <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
            <div className="grid gap-3 md:grid-cols-3">
              {form.gallery.map((image) => (
                <div key={image} className="relative overflow-hidden rounded-xl border border-line/80">
                  <Image src={image} alt="Galería" width={320} height={200} className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, gallery: prev.gallery.filter((item) => item !== image) }))
                    }
                    className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t border-line/70 pt-5">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addBlock('paragraph')}
                className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]"
              >
                + Párrafo
              </button>
              <button
                type="button"
                onClick={() => addBlock('heading')}
                className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]"
              >
                + H2/H3
              </button>
              <button
                type="button"
                onClick={() => addBlock('list')}
                className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]"
              >
                + Lista
              </button>
              <button
                type="button"
                onClick={() => addBlock('quote')}
                className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]"
              >
                + Cita
              </button>
              <button
                type="button"
                onClick={() => addBlock('image')}
                className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]"
              >
                + Imagen
              </button>
            </div>

            <div className="space-y-4">
              {form.content.map((block, index) => (
                <div key={block.id} className="rounded-2xl border border-line/80 bg-white/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.15em] text-muted">
                      Bloque {index + 1}: {block.type}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      className="text-xs font-semibold uppercase tracking-[0.15em] text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>

                  {block.type === 'paragraph' ? (
                    <textarea
                      rows={4}
                      value={block.text}
                      onChange={(event) => handleBlockUpdate(block.id, { text: event.target.value })}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2"
                    />
                  ) : null}

                  {block.type === 'heading' ? (
                    <div className="space-y-3">
                      <input
                        value={block.text}
                        onChange={(event) => handleBlockUpdate(block.id, { text: event.target.value })}
                        className="w-full rounded-xl border border-line bg-white px-3 py-2"
                      />
                      <select
                        value={block.level}
                        onChange={(event) =>
                          handleBlockUpdate(block.id, {
                            level: Number(event.target.value) as 2 | 3,
                          })
                        }
                        className="w-full rounded-xl border border-line bg-white px-3 py-2"
                      >
                        <option value={2}>H2</option>
                        <option value={3}>H3</option>
                      </select>
                    </div>
                  ) : null}

                  {block.type === 'list' ? (
                    <div className="space-y-3">
                      <select
                        value={block.style}
                        onChange={(event) =>
                          handleBlockUpdate(block.id, {
                            style: event.target.value as 'ordered' | 'unordered',
                          })
                        }
                        className="w-full rounded-xl border border-line bg-white px-3 py-2"
                      >
                        <option value="unordered">Lista con viñetas</option>
                        <option value="ordered">Lista numerada</option>
                      </select>
                      <textarea
                        rows={4}
                        value={block.items.join('\n')}
                        onChange={(event) =>
                          handleBlockUpdate(block.id, {
                            items: event.target.value.split('\n').filter(Boolean),
                          })
                        }
                        placeholder="Un item por línea"
                        className="w-full rounded-xl border border-line bg-white px-3 py-2"
                      />
                    </div>
                  ) : null}

                  {block.type === 'quote' ? (
                    <div className="space-y-3">
                      <textarea
                        rows={3}
                        value={block.text}
                        onChange={(event) => handleBlockUpdate(block.id, { text: event.target.value })}
                        className="w-full rounded-xl border border-line bg-white px-3 py-2"
                      />
                      <input
                        value={block.citation ?? ''}
                        onChange={(event) => handleBlockUpdate(block.id, { citation: event.target.value })}
                        placeholder="Cita / fuente"
                        className="w-full rounded-xl border border-line bg-white px-3 py-2"
                      />
                    </div>
                  ) : null}

                  {block.type === 'image' ? (
                    <div className="space-y-3">
                      <input
                        value={block.src}
                        onChange={(event) => handleBlockUpdate(block.id, { src: event.target.value })}
                        placeholder="URL de imagen"
                        className="w-full rounded-xl border border-line bg-white px-3 py-2"
                      />
                      <input
                        value={block.alt}
                        onChange={(event) => handleBlockUpdate(block.id, { alt: event.target.value })}
                        placeholder="Texto alternativo"
                        className="w-full rounded-xl border border-line bg-white px-3 py-2"
                      />
                      <input
                        value={block.caption ?? ''}
                        onChange={(event) => handleBlockUpdate(block.id, { caption: event.target.value })}
                        placeholder="Pie de foto"
                        className="w-full rounded-xl border border-line bg-white px-3 py-2"
                      />
                      <select
                        value={block.align}
                        onChange={(event) =>
                          handleBlockUpdate(block.id, {
                            align: event.target.value as 'left' | 'center' | 'right' | 'wide',
                          })
                        }
                        className="w-full rounded-xl border border-line bg-white px-3 py-2"
                      >
                        <option value="left">Alineada izquierda</option>
                        <option value="center">Centrada</option>
                        <option value="right">Alineada derecha</option>
                        <option value="wide">Ancha</option>
                      </select>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-wrap gap-3 border-t border-line/70 pt-5">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="rounded-full bg-brand px-6 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar artículo'}
            </button>
            {form.id ? (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-full border border-red-300 px-6 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-red-700"
              >
                Eliminar
              </button>
            ) : null}
          </div>
        </div>

        <aside className="card-surface space-y-5 p-6 xl:sticky xl:top-24 xl:h-fit">
          <div>
            <p className="section-subtitle">Vista previa</p>
            <h3 className="mt-1 font-display text-2xl">{form.title || 'Título del artículo'}</h3>
            <p className="mt-2 text-sm text-muted">{form.metaDescription || 'Descripción SEO del artículo.'}</p>
          </div>

          {form.featuredImage ? (
            <Image
              src={form.featuredImage}
              alt={form.title || 'Imagen destacada'}
              width={700}
              height={420}
              className="h-48 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-line text-sm text-muted">
              Imagen destacada pendiente
            </div>
          )}

          <div className="text-xs uppercase tracking-[0.15em] text-muted">
            Estado: <span className="font-semibold text-ink">{form.status}</span>
          </div>

          <div className="max-h-[460px] space-y-4 overflow-auto pr-1">
            <ArticleBlocksRenderer blocks={form.content} />
          </div>
        </aside>
      </form>
    </section>
  );
}

