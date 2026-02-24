import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-shell py-20">
      <div className="card-surface mx-auto max-w-2xl space-y-5 p-10 text-center">
        <p className="section-subtitle">Error 404</p>
        <h1 className="font-display text-5xl">Contenido no encontrado</h1>
        <p className="text-muted">
          El recurso solicitado no existe o todavía no está publicado. Puedes volver a la portada.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-full border border-brand px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand transition hover:bg-brand hover:text-white"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
