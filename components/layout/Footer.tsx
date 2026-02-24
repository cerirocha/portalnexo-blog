import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line/80 bg-[#f2efe6]">
      <div className="container-shell py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <p className="font-display text-3xl text-ink">Portal Nexo</p>
            <p className="max-w-md text-sm leading-relaxed text-muted">
              Revista digital de finanzas personales, inversiones y economía. Diseñada para informar,
              posicionar en SEO y escalar audiencia de alto valor.
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">© {new Date().getFullYear()} Portal Nexo Media</p>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Secciones</p>
            <ul className="space-y-2 text-sm text-ink/85">
              <li>
                <Link href="/categoria/finanzas-personales" className="hover:text-brand">
                  Finanzas personales
                </Link>
              </li>
              <li>
                <Link href="/categoria/inversiones" className="hover:text-brand">
                  Inversiones
                </Link>
              </li>
              <li>
                <Link href="/categoria/economia" className="hover:text-brand">
                  Economía
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Legal</p>
            <ul className="space-y-2 text-sm text-ink/85">
              <li>
                <Link href="#" className="hover:text-brand">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand">
                  Términos de uso
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-brand">
                  Acceso admin
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

