import type { ReactNode } from "react";
import Link from "next/link";
import { buttonVariants } from "@heroui/react/button";
import { Surface } from "@heroui/react/surface";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CATEGORIES } from "@/lib/constants";

function StepCard({
  step,
  title,
  description,
  icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-surface/60 p-6 transition-colors hover:border-primary/35">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
        {icon}
      </div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
        Paso {step}
      </p>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}

export default function Home() {
  const primaryCta = buttonVariants({
    variant: "primary",
    size: "lg",
    className:
      "bg-primary px-8 text-base font-semibold text-white no-underline hover:opacity-95",
  });
  const accentCta = buttonVariants({
    variant: "secondary",
    size: "lg",
    className:
      "border-0 bg-accent px-8 text-base font-semibold text-on-light no-underline hover:opacity-95",
  });
  const accentSolo = buttonVariants({
    size: "lg",
    className:
      "mt-8 border-0 bg-accent font-semibold text-on-light no-underline hover:opacity-95",
  });

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            aria-hidden
          >
            <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-16 md:pb-32 md:pt-24">
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Encuentra al crack que necesitas. O sé el crack que te contraten.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted md:text-xl">
              El marketplace de talento freelance más top de Lima.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/explorar" className={primaryCta}>
                Explorar talentos
              </Link>
              <Link href="/#para-freelancers" className={accentCta}>
                Publicar mis habilidades
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <h2 className="mb-3 text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Categorías populares
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-sm text-muted md:text-base">
            Explora por especialidad y encuentra talento alineado a tu
            proyecto.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Surface
                key={cat.id}
                variant="secondary"
                className="rounded-2xl border border-border p-6 transition-all hover:border-primary/40 hover:bg-surface-elevated/80"
              >
                <div className="mb-4 text-4xl" aria-hidden>
                  {cat.emoji}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {cat.label}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  <span className="font-semibold text-primary">
                    {cat.freelancerCount}+
                  </span>{" "}
                  freelancers
                </p>
              </Surface>
            ))}
          </div>
        </section>

        <section
          id="como-funciona"
          className="border-y border-border/60 bg-surface/30 py-20 md:py-28"
        >
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-3 text-center text-2xl font-semibold md:text-3xl">
              ¿Cómo funciona?
            </h2>
            <p className="mx-auto mb-14 max-w-lg text-center text-sm text-muted">
              Tres pasos. Sin fricción.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              <StepCard
                step={1}
                title="Explora perfiles"
                description="Filtra por categoría, distrito y tarifa. Lee habilidades y reseñas reales."
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                  </svg>
                }
              />
              <StepCard
                step={2}
                title="Contacta con un token"
                description="Solicita contacto de forma segura. Nosotros mediaremos el primer acercamiento."
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10h8M8 14h5M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                    />
                  </svg>
                }
              />
              <StepCard
                step={3}
                title="Coordinan y listo"
                description="Acuerdan alcance y honorarios. Tú sigues el proyecto desde un solo lugar."
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 md:py-24">
          <div className="grid gap-10 rounded-3xl border border-border bg-surface/40 px-6 py-12 md:grid-cols-3 md:px-12">
            <div className="text-center">
              <p className="text-4xl font-semibold tracking-tight text-primary md:text-5xl">
                500+
              </p>
              <p className="mt-2 text-sm font-medium text-muted">Freelancers</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-semibold tracking-tight text-accent md:text-5xl">
                12
              </p>
              <p className="mt-2 text-sm font-medium text-muted">Distritos</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                1,200+
              </p>
              <p className="mt-2 text-sm font-medium text-muted">
                Contactos realizados
              </p>
            </div>
          </div>
        </section>

        <section id="para-freelancers" className="border-t border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-24">
            <h2 className="text-2xl font-semibold md:text-3xl">
              ¿Eres freelancer en Lima?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Publica tu perfil, muestra tu portafolio y recibe solicitudes de
              empresas que buscan exactamente tu perfil.
            </p>
            <Link href="/explorar" className={accentSolo}>
              Empezar ahora
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
