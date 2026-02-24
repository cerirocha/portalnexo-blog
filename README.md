# Portal Nexo (Next.js 14 + Firebase)

Proyecto base de blog profesional tipo revista, preparado para monetizar con anuncios, escalar tráfico alto y mantener arquitectura limpia.

## Stack
- Next.js 14 (App Router)
- TypeScript estricto
- Tailwind CSS
- Firebase Auth + Firestore + Storage + Hosting

## Arquitectura
```text
app/
  page.tsx                       # Home revista
  articulo/[slug]/page.tsx       # Detalle de artículo + schema.org
  categoria/[slug]/page.tsx      # Landing por categoría
  admin/login/page.tsx           # Login admin
  admin/page.tsx                 # Dashboard admin protegido
  sitemap.ts                     # Sitemap dinámico
  robots.ts                      # Robots + bloqueo admin
components/
  ads/AdSlot.tsx                 # Integración AdSense
  article/*                      # Tarjetas, render bloques, relacionados
  home/*                         # Hero, grids, sidebar popular
  admin/*                        # CRUD categorías/artículos + preview
  layout/*                       # Header/Footer
lib/
  firebase/client.ts             # SDK cliente
  firebase/admin.ts              # SDK admin (server)
  validators.ts                  # Zod schemas
  seo.ts                         # Metadata + schema builder
  utils.ts                       # Slugs, formato fecha, etc.
services/
  publicContentService.ts        # Consultas públicas con cache ISR
  adminService.ts                # CRUD admin + subida imágenes
hooks/
  useAdminAuth.ts                # Estado auth admin
types/
  content.ts                     # Dominio tipado
```

## Funcionalidades incluidas
- Home tipo portal editorial con hero destacado, recientes, secciones por categoría y sidebar popular.
- Navegación dinámica por categorías desde Firestore.
- Sistema de artículos completo:
  - título, slug SEO, featured image, galería opcional
  - contenido por bloques (párrafo, H2/H3, lista, cita, imagen alineable)
  - autor, fecha, meta description, tags
  - estado draft/publicado
- SEO técnico:
  - metadata dinámica
  - OpenGraph/Twitter
  - Sitemap automático
  - Schema.org `Article`
- Panel admin protegido por Firebase Auth + UID único:
  - CRUD categorías
  - CRUD artículos
  - upload de imágenes a Firebase Storage
  - preview antes de publicar
- ISR y caché con `unstable_cache`.
- Estructura modular limpia para crecimiento.
- Slots listos para AdSense (`AdSlot`).

## Variables de entorno
Copia `.env.example` a `.env.local` y completa valores:

```bash
cp .env.example .env.local
```

Claves críticas:
- `NEXT_PUBLIC_ADMIN_UID`: UID del único administrador autorizado.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: para lecturas server-side (ISR/SEO/sitemap).
- `NEXT_PUBLIC_ADSENSE_CLIENT`: opcional para anuncios reales.

## Configuración Firebase (paso a paso)
1. Crear proyecto Firebase.
2. Activar:
   - Authentication (Email/Password)
   - Firestore (modo producción)
   - Storage
3. Crear una Web App Firebase y copiar credenciales públicas al `.env.local`.
4. Crear usuario admin en Auth (email/password) y guardar su UID.
5. Reemplazar `YOUR_ADMIN_UID` en:
   - `firestore.rules`
   - `storage.rules`
6. Configurar credenciales admin server-side:
   - Opción A: Service Account JSON convertido a variables (`FIREBASE_*`)
   - Opción B: credenciales por defecto del entorno Firebase en producción.

## Estructura de datos Firestore
### `categories/{id}`
```json
{
  "name": "Inversiones",
  "slug": "inversiones",
  "description": "Guías y estrategias de inversión para perfil conservador y agresivo.",
  "order": 1,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `articles/{id}`
```json
{
  "title": "...",
  "slug": "...",
  "featuredImage": "https://...",
  "gallery": ["https://..."],
  "content": [{ "id": "...", "type": "paragraph", "text": "..." }],
  "authorName": "...",
  "authorRole": "...",
  "categoryId": "...",
  "categoryName": "...",
  "categorySlug": "...",
  "status": "draft | published",
  "tags": ["..."],
  "metaDescription": "...",
  "isFeatured": true,
  "popularityScore": 100,
  "publishedAt": "timestamp",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Reglas seguras (1 admin)
Incluidas en:
- `firestore.rules`
- `storage.rules`

Política aplicada:
- Lectura pública solo de artículos `published`.
- Escritura en categorías/artículos/storage solo para `request.auth.uid == YOUR_ADMIN_UID`.

## Desarrollo local
```bash
npm install
npm run dev
```

## Deploy en Firebase Hosting (frameworks)
1. Instalar CLI:
```bash
npm i -g firebase-tools
firebase login
```
2. Configurar proyecto:
```bash
firebase use --add
```
3. Deploy de reglas/indexes:
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```
4. Deploy de app Next.js en Hosting:
```bash
firebase deploy --only hosting
```

`firebase.json` ya incluye `frameworksBackend` para Next.js.

## AdSense
- Define `NEXT_PUBLIC_ADSENSE_CLIENT`.
- Cambia `slot` en `components/ads/AdSlot.tsx` por IDs reales.
- Ubicaciones iniciales:
  - Home sidebar
  - Home bottom
  - Top del artículo

## Estrategia para escalar a 1M+ visitas/mes
1. Mantener ISR (`revalidate`) y revisar intervalos por sección.
2. Añadir invalidación granular con tags (`revalidateTag`) en cada publicación/edición.
3. Activar CDN global de Firebase Hosting (ya integrado por defecto).
4. Mantener imágenes comprimidas, con tamaños controlados y lazy-loading.
5. Evitar consultas sin índice; usar `firestore.indexes.json` versionado.
6. Migrar `popularityScore` a pipeline de analytics/eventos (BigQuery + jobs).
7. Introducir caché edge para endpoints de alto tráfico (si se agregan APIs públicas).
8. Monitorizar Core Web Vitals y error budget con alertas.
9. Separar entorno `staging` y `production` en Firebase projects.
10. Ejecutar pruebas de carga periódicas en rutas top (`/`, `/articulo/[slug]`).

## Notas
- El proyecto está listo para crecer sin reestructurar capas principales.
- Para multisite/multi-autor en el futuro, basta extender reglas y modelo de `users/roles`.

