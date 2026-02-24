'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { signInAdmin } from '@/services/adminService';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAdmin, loading } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace('/admin');
    }
  }, [loading, isAdmin, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await signInAdmin(email, password);
      router.replace('/admin');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-shell py-16">
      <div className="card-surface mx-auto max-w-md space-y-6 p-8">
        <div>
          <p className="section-subtitle">Acceso privado</p>
          <h1 className="mt-1 font-display text-4xl">Panel admin</h1>
          <p className="mt-2 text-sm text-muted">Solo usuario autorizado por UID en Firebase.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.15em] text-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.15em] text-muted">Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none ring-brand transition focus:ring-2"
            />
          </label>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-brand px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-50"
          >
            {busy ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
