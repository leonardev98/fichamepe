import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          <span className="text-primary">fícháme</span>
          <span className="text-accent">.pe</span>
        </Link>
        <p className="text-sm text-muted">
          © {year} fícháme.pe. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
