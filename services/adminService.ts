'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { auth, db, storage } from '@/lib/firebase/client';
import { articleSchema, categorySchema } from '@/lib/validators';
import { Article, ArticleInput, Category } from '@/types/content';

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

function assertAdmin(user: User | null) {
  if (!user || user.uid !== ADMIN_UID) {
    throw new Error('Acceso restringido a administrador.');
  }
}

async function revalidatePublicContent(
  user: User | null,
  payload?: { articleSlug?: string; categorySlug?: string },
) {
  if (!user) {
    return;
  }

  try {
    const token = await user.getIdToken();
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload ?? {}),
    });

    if (!response.ok) {
      console.warn('No se pudo revalidar cache publica');
    }
  } catch (error) {
    console.warn('No se pudo revalidar cache publica', error);
  }
}

export async function signInAdmin(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  assertAdmin(credential.user);
  return credential.user;
}

export async function signOutAdmin() {
  await signOut(auth);
}

export async function uploadArticleImage(file: File, folder = 'featured') {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.\-_]/g, '-');
  const path = `articles/${folder}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function getAdminCategories() {
  const snapshot = await getDocs(query(collection(db, 'categories'), orderBy('order', 'asc')));

  return snapshot.docs.map((item) => {
    const data = item.data();
    return {
      id: item.id,
      name: String(data.name ?? ''),
      slug: String(data.slug ?? ''),
      description: String(data.description ?? ''),
      order: Number(data.order ?? 0),
      createdAt: data.createdAt?.toDate?.(),
      updatedAt: data.updatedAt?.toDate?.(),
    } satisfies Category;
  });
}

export async function createCategory(user: User | null, payload: Omit<Category, 'id'>) {
  assertAdmin(user);
  const parsed = categorySchema.parse(payload);

  await addDoc(collection(db, 'categories'), {
    ...parsed,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await revalidatePublicContent(user, { categorySlug: parsed.slug });
}

export async function updateCategoryById(
  user: User | null,
  categoryId: string,
  payload: Omit<Category, 'id'>,
) {
  assertAdmin(user);
  const parsed = categorySchema.parse(payload);

  await updateDoc(doc(db, 'categories', categoryId), {
    ...parsed,
    updatedAt: serverTimestamp(),
  });

  await revalidatePublicContent(user, { categorySlug: parsed.slug });
}

export async function deleteCategoryById(user: User | null, categoryId: string) {
  assertAdmin(user);
  await deleteDoc(doc(db, 'categories', categoryId));
  await revalidatePublicContent(user);
}

export async function getAdminArticles() {
  const snapshot = await getDocs(query(collection(db, 'articles'), orderBy('updatedAt', 'desc')));

  return snapshot.docs.map((item) => {
    const data = item.data();
    return {
      id: item.id,
      title: String(data.title ?? ''),
      slug: String(data.slug ?? ''),
      featuredImage: String(data.featuredImage ?? ''),
      gallery: (data.gallery as string[] | undefined) ?? [],
      content: (data.content as Article['content'] | undefined) ?? [],
      authorName: String(data.authorName ?? ''),
      authorRole: data.authorRole ? String(data.authorRole) : undefined,
      categoryId: String(data.categoryId ?? ''),
      categoryName: String(data.categoryName ?? ''),
      categorySlug: String(data.categorySlug ?? ''),
      status: (data.status as Article['status']) ?? 'draft',
      tags: (data.tags as string[] | undefined) ?? [],
      metaDescription: String(data.metaDescription ?? ''),
      isFeatured: Boolean(data.isFeatured),
      popularityScore: Number(data.popularityScore ?? 0),
      publishedAt: data.publishedAt?.toDate?.(),
      createdAt: data.createdAt?.toDate?.(),
      updatedAt: data.updatedAt?.toDate?.(),
    } satisfies Article;
  });
}

export async function saveArticle(user: User | null, input: ArticleInput) {
  assertAdmin(user);

  const { id, ...payload } = input;
  const parsed = articleSchema.parse(payload);

  const now = serverTimestamp();
  const finalData = {
    ...parsed,
    publishedAt: parsed.status === 'published' ? input.publishedAt ?? now : null,
    updatedAt: now,
  };

  if (id) {
    await setDoc(doc(db, 'articles', id), finalData, { merge: true });
    await revalidatePublicContent(user, {
      articleSlug: parsed.slug,
      categorySlug: parsed.categorySlug,
    });
    return id;
  }

  const created = await addDoc(collection(db, 'articles'), {
    ...finalData,
    createdAt: now,
  });
  await revalidatePublicContent(user, {
    articleSlug: parsed.slug,
    categorySlug: parsed.categorySlug,
  });
  return created.id;
}

export async function deleteArticleById(user: User | null, articleId: string) {
  assertAdmin(user);
  await deleteDoc(doc(db, 'articles', articleId));
  await revalidatePublicContent(user);
}

