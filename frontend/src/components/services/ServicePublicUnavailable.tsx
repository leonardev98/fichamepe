import Link from "next/link";
import { EyeOff } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export function ServicePublicUnavailable() {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Navbar />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted/40 text-muted">
          <EyeOff className="size-7" aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          Esta publicación no está disponible
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Puede haber sido pausada, retirada por moderación o el enlace ya no es válido. Las
          publicaciones solo se muestran cuando están activas en el catálogo.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/explorar"
            className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:opacity-95"
          >
            Explorar servicios
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground no-underline transition hover:bg-primary/5"
          >
            Ir al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
