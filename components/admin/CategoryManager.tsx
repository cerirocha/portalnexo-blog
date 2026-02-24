'use client';

import { User } from 'firebase/auth';
import { FormEvent, useMemo, useState } from 'react';

import {
  createCategory,
  deleteCategoryById,
  updateCategoryById,
} from '@/services/adminService';
import { createSlug } from '@/lib/utils';
import { Category } from '@/types/content';

interface CategoryManagerProps {
  user: User | null;
  categories: Category[];
  onChange: () => Promise<void>;
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  order: 0,
};

export function CategoryManager({ user, categories, onChange }: CategoryManagerProps) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const orderedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const payload = {
        ...form,
        slug: form.slug || createSlug(form.name),
      };

      if (editingId) {
        await updateCategoryById(user, editingId, payload);
      } else {
        await createCategory(user, payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      await onChange();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar la categoría');
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      order: category.order,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta categoría?')) {
      return;
    }

    try {
      await deleteCategoryById(user, id);
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await onChange();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'No se pudo eliminar');
    }
  };

  return (
    <section className="card-surface space-y-6 p-6">
      <div>
        <p className="section-subtitle">Administración</p>
        <h2 className="mt-1 font-display text-3xl">Categorías</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-xs uppercase tracking-[0.15em] text-muted">Nombre</span>
          <input
            required
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                name: event.target.value,
                slug: createSlug(event.target.value),
              }))
            }
            className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-xs uppercase tracking-[0.15em] text-muted">Slug</span>
          <input
            required
            value={form.slug}
            onChange={(event) => setForm((prev) => ({ ...prev, slug: createSlug(event.target.value) }))}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
          />
        </label>

        <label className="space-y-1 text-sm md:col-span-2">
          <span className="text-xs uppercase tracking-[0.15em] text-muted">Descripción</span>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-xs uppercase tracking-[0.15em] text-muted">Orden</span>
          <input
            type="number"
            min={0}
            value={form.order}
            onChange={(event) => setForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
          />
        </label>

        <div className="flex items-end gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-brand px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-50"
          >
            {editingId ? 'Actualizar' : 'Crear'}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-full border border-line px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em]"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-3">
        {orderedCategories.map((category) => (
          <div
            key={category.id}
            className="flex flex-col gap-3 rounded-xl border border-line/80 bg-white/70 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-semibold text-ink">{category.name}</p>
              <p className="text-xs text-muted">/{category.slug}</p>
              <p className="mt-1 text-sm text-muted">{category.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleEdit(category)}
                className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em]"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(category.id)}
                className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
