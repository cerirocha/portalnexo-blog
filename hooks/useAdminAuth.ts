'use client';

import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';

import { auth } from '@/lib/firebase/client';

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const isAdmin = useMemo(() => Boolean(user && user.uid === ADMIN_UID), [user]);

  return { user, isAdmin, loading };
}
