'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { loading, isAdmin } = useAdminAuth();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/admin/login');
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="card-surface flex min-h-[240px] items-center justify-center p-6 text-sm text-muted">
        Verificando sesión de administrador...
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
