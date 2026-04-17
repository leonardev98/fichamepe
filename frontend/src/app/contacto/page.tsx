import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircleHeart } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contacto",
  description:
    "Conversa con el equipo de FichaMePe por correo o únete a la comunidad oficial de WhatsApp.",
  path: "/contacto",
  keywords: ["contacto fichamepe", "comunidad whatsapp fichamepe", "soporte freelance"],
});

export default function ContactoPage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Contacto</p>
          <h1 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
            Estamos listos para conversar contigo
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Si tienes dudas, sugerencias o quieres apoyo con tu cuenta, escríbenos. También puedes
            unirte a nuestra comunidad para enterarte de novedades y compartir ideas.
          </p>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Correo directo</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              ¿Prefieres escribirnos por email? Te respondemos con gusto.
            </p>
            <Link
              href="mailto:contactmitsyy@gmail.com"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
            >
              contactmitsyy@gmail.com
            </Link>
          </article>

          <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <MessageCircleHeart className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Comunidad de WhatsApp</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Súmate a la comunidad para pertenecer, compartir y mantenerte al día con FichaMePe.
            </p>
            <Link
              href="https://chat.whatsapp.com/JbMSIrdqv1qC6l01cQvrLs"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-success/25 bg-success/10 px-4 py-2 text-sm font-semibold text-success transition hover:border-success/45 hover:bg-success/15"
            >
              Unirme al grupo de WhatsApp
            </Link>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
