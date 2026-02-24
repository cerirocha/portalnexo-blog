import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';

import { getAdminApp } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

interface RevalidatePayload {
  articleSlug?: string;
  categorySlug?: string;
}

function getBearerToken(request: NextRequest) {
  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice(7).trim();
}

export async function POST(request: NextRequest) {
  const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID;

  if (!adminUid) {
    return NextResponse.json({ error: 'Admin UID no configurado.' }, { status: 500 });
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Token no enviado.' }, { status: 401 });
  }

  let decodedUid = '';

  try {
    const decodedToken = await getAuth(getAdminApp()).verifyIdToken(token);
    decodedUid = decodedToken.uid;
  } catch {
    return NextResponse.json({ error: 'Token invalido.' }, { status: 401 });
  }

  if (decodedUid !== adminUid) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  let payload: RevalidatePayload = {};

  try {
    payload = (await request.json()) as RevalidatePayload;
  } catch {
    payload = {};
  }

  const articleSlug = typeof payload.articleSlug === 'string' ? payload.articleSlug.trim() : '';
  const categorySlug = typeof payload.categorySlug === 'string' ? payload.categorySlug.trim() : '';

  revalidateTag('articles');
  revalidateTag('categories');
  revalidatePath('/');
  revalidatePath('/robots.txt');
  revalidatePath('/sitemap.xml');

  if (articleSlug) {
    revalidatePath(`/articulo/${articleSlug}`);
  }

  if (categorySlug) {
    revalidatePath(`/categoria/${categorySlug}`);
  }

  return NextResponse.json({
    ok: true,
    revalidated: {
      articleSlug: articleSlug || null,
      categorySlug: categorySlug || null,
    },
  });
}
