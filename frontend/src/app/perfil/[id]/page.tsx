import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BriefcaseBusiness, MapPin, ShieldCheck, Star } from "lucide-react";
import { ReportUserButton } from "@/components/moderation/ReportUserButton";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { fetchPublicProfileById } from "@/lib/api/public-profiles.api";
import { fetchServicesByProfileId } from "@/lib/api/services.api";
import { SEO_DEFAULT_OG_IMAGE, SEO_SITE_NAME, truncateText } from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 60 * 60 * 24;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await fetchPublicProfileById(id).catch(() => null);
  if (!profile) {
    return {
      title: "Perfil no disponible",
      description: "Este perfil ya no está disponible en FichaMePe.",
      alternates: { canonical: `/perfil/${id}` },
      robots: { index: false, follow: false },
    };
  }
  const skillNames = profile.skills.slice(0, 5).map((skill) => skill.name);
  const description = truncateText(
    profile.bio ??
      `${profile.displayName} publica servicios freelance en FichaMePe${
        profile.district ? ` desde ${profile.district}` : ""
      }.`,
    160,
  );

  return {
    title: `${profile.displayName}${profile.district ? ` en ${profile.district}` : ""}`,
    description,
    keywords: ["perfil freelance", ...skillNames, profile.district ?? "lima"],
    alternates: { canonical: `/perfil/${profile.id}` },
    openGraph: {
      type: "profile",
      locale: "es_PE",
      siteName: SEO_SITE_NAME,
      title: `${profile.displayName} | ${SEO_SITE_NAME}`,
      description,
      url: `/perfil/${profile.id}`,
      images: [
        {
          url: profile.avatarUrl ?? SEO_DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: profile.displayName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.displayName} | ${SEO_SITE_NAME}`,
      description,
      images: [profile.avatarUrl ?? SEO_DEFAULT_OG_IMAGE],
    },
  };
}

export default async function PerfilPage({
  params,
}: PageProps) {
  const { id } = await params;

  const profile = await fetchPublicProfileById(id).catch(() => null);
  const services = await fetchServicesByProfileId(id).catch(() => []);

  if (!profile) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `https://fichame.pe/perfil/${profile.id}`,
    mainEntity: {
      "@type": "Person",
      name: profile.displayName,
      description: profile.bio ?? undefined,
      image: profile.avatarUrl ?? undefined,
      address: profile.district
        ? {
            "@type": "PostalAddress",
            addressLocality: profile.district,
            addressCountry: "PE",
          }
        : undefined,
      knowsAbout: profile.skills.map((skill) => skill.name),
    },
  };

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-10">
        <section className="overflow-hidden rounded-3xl border border-border bg-white">
          <div className="relative h-28 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent sm:h-36">
            <span className="absolute left-5 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" aria-hidden />
              Perfil verificado por FichaMePe
            </span>
          </div>
          <div className="px-5 pb-6 pt-0 sm:px-7">
            <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-primary/10">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <span
                      className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10"
                      aria-hidden
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-bold text-foreground">{profile.displayName}</h1>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted">
                    <span
                      className={`inline-block size-2 rounded-full ${
                        profile.isAvailable ? "bg-success" : "bg-muted"
                      }`}
                      aria-hidden
                    />
                    {profile.isAvailable ? "Disponible ahora" : "No disponible ahora"}
                    {profile.district ? (
                      <>
                        <span className="text-border">•</span>
                        <MapPin className="size-3.5" aria-hidden />
                        {profile.district}
                      </>
                    ) : null}
                  </p>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                <Link
                  href="/explorar"
                  className="inline-flex w-full items-center justify-center rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary no-underline transition hover:bg-primary/5 sm:w-auto"
                >
                  Explorar más servicios
                </Link>
                <ReportUserButton reportedUserId={profile.userId} displayName={profile.displayName} />
              </div>
            </div>

            {profile.bio ? <p className="mt-5 text-sm leading-relaxed text-muted">{profile.bio}</p> : null}

            <div className="mt-5 flex flex-wrap gap-2">
              {(profile.skills ?? []).map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {skill.name}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-surface px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Publicaciones activas</p>
                <p className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-foreground">
                  <BriefcaseBusiness className="size-4 text-primary" aria-hidden />
                  {services.length}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Valoración estimada</p>
                <p className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Star className="size-4 text-primary" aria-hidden />
                  4.8
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Perfil</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {profile.hourlyRate ? `Desde S/ ${profile.hourlyRate.toFixed(0)}/h` : "Tarifa por cotización"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-foreground">Publicaciones de este vendedor</h2>
          <p className="mt-1 text-sm text-muted">
            Servicios activos publicados por {profile.displayName}.
          </p>
          {services.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-white p-6 text-sm text-muted">
              Este vendedor aún no tiene publicaciones activas.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
