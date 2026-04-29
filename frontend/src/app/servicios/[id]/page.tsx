import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleCheckBig, Clock3, Eye, MapPin, ShieldCheck } from "lucide-react";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { ServiceDetailActions } from "@/components/services/ServiceDetailActions";
import { ServiceViewTracker } from "@/components/services/ServiceViewTracker";
import { ServicePublicUnavailable } from "@/components/services/ServicePublicUnavailable";
import { ServiceReviewsSection } from "@/components/reviews/ServiceReviewsSection";
import {
  fetchFeedServicesSafe,
  fetchServiceByIdOrNull,
  fetchServicesByProfileId,
} from "@/lib/api/services.api";
import { SEO_DEFAULT_OG_IMAGE, SEO_SITE_NAME, truncateText } from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const service = await fetchServiceByIdOrNull(id);
    if (!service) {
      return {
        title: "Publicación no disponible",
        description: "Esta publicación ya no está disponible en FichaMePe.",
        alternates: { canonical: `/servicios/${id}` },
        robots: { index: false, follow: false },
      };
    }
    const description = truncateText(service.description, 160);
    const image = service.coverImageUrl ?? SEO_DEFAULT_OG_IMAGE;
    return {
      title: service.title,
      description,
      keywords: [
        service.category,
        ...service.tags.slice(0, 6),
        "servicio freelance",
        "contratar freelancer",
      ],
      alternates: {
        canonical: `/servicios/${service.id}`,
      },
      openGraph: {
        type: "article",
        locale: "es_PE",
        siteName: SEO_SITE_NAME,
        title: `${service.title} | ${SEO_SITE_NAME}`,
        description,
        url: `/servicios/${service.id}`,
        publishedTime: service.createdAt,
        modifiedTime: service.updatedAt,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: service.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${service.title} | ${SEO_SITE_NAME}`,
        description,
        images: [image],
      },
    };
  } catch {
    return { title: "Servicio" };
  }
}

export default async function ServicioDetailPage({ params }: PageProps) {
  const { id } = await params;

  let service: Awaited<ReturnType<typeof fetchServiceByIdOrNull>>;
  try {
    service = await fetchServiceByIdOrNull(id);
  } catch {
    notFound();
  }

  if (service === null) {
    return <ServicePublicUnavailable />;
  }

  const profile = service.profile;
  const sellerProfileHref = `/perfil/${service.profileId}`;

  const [similarFeed, sameSellerServices] = await Promise.all([
    fetchFeedServicesSafe({
      limit: 8,
      orderBy: "popular",
      tags: service.tags.slice(0, 2),
    }),
    fetchServicesByProfileId(service.profileId).catch(() => []),
  ]);

  const sellerServices = sameSellerServices
    .filter((candidate) => candidate.id !== service.id)
    .slice(0, 4);
  const similarServices = similarFeed.services
    .filter((candidate) => candidate.id !== service.id)
    .filter((candidate) => candidate.profileId !== service.profileId)
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: truncateText(service.description, 500),
    category: service.category,
    provider: {
      "@type": "Person",
      name: profile?.displayName ?? "Freelancer",
      url: `https://fichame.pe/perfil/${service.profileId}`,
    },
    areaServed: "Lima, Peru",
    offers: {
      "@type": "Offer",
      priceCurrency: service.currency ?? "PEN",
      price: service.price ?? undefined,
      availability: "https://schema.org/InStock",
      url: `https://fichame.pe/servicios/${service.id}`,
    },
    aggregateRating:
      service.reviewCount && service.reviewAverage
        ? {
            "@type": "AggregateRating",
            ratingValue: service.reviewAverage,
            reviewCount: service.reviewCount,
          }
        : undefined,
    datePublished: service.createdAt,
    dateModified: service.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://fichame.pe/servicios/${service.id}`,
    },
  };

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <ServiceViewTracker serviceId={service.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-10">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-border bg-white">
              <div className="relative aspect-[16/9] w-full bg-surface-elevated">
                {service.coverImageUrl ? (
                  <Image
                    src={service.coverImageUrl}
                    alt={service.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    priority
                  />
                ) : (
                  <div className="fp-gradient-bg flex h-full w-full items-end p-6">
                    <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      {service.category}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-border p-5 sm:p-6">
                <Link
                  href={sellerProfileHref}
                  className="inline-flex items-center gap-2 text-sm text-muted no-underline transition hover:text-primary"
                >
                  <span className="relative h-7 w-7 overflow-hidden rounded-full bg-primary/10">
                    {profile?.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    ) : (
                      <span
                        className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10"
                        aria-hidden
                      />
                    )}
                  </span>
                  <span className="font-semibold">{profile?.displayName ?? "Freelancer"}</span>
                </Link>
                <h1 className="mt-2 text-2xl font-bold leading-tight text-foreground sm:text-[2rem]">
                  {service.title}
                </h1>
                <p className="mt-4 text-base leading-relaxed text-muted">
                  {service.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-white p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-foreground">¿Qué incluye este servicio?</h2>
              <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2">
                <p className="inline-flex items-center gap-2">
                  <Clock3 className="size-4 text-primary" aria-hidden />
                  Entrega: {service.deliveryTime}
                </p>
                <p className="inline-flex items-center gap-2">
                  <CircleCheckBig className="size-4 text-primary" aria-hidden />
                  Revisiones: {service.revisionsIncluded}
                </p>
                <p className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-primary" aria-hidden />
                  Modalidad: {service.deliveryMode}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Eye className="size-4 text-primary" aria-hidden />
                  {service.viewCount}{" "}
                  {service.viewCount === 1 ? "vista" : "vistas"}
                </p>
              </div>
            </div>

            <ServiceReviewsSection
              serviceId={service.id}
              serviceTitle={service.title}
              sellerUserId={service.userId}
              reviewCount={service.reviewCount ?? 0}
              reviewAverage={service.reviewAverage ?? 0}
            />
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-white p-5">
              <PriceDisplay variant="card" price={service.price} previousPrice={service.previousPrice} />
              <p className="mt-1 text-xs text-muted">Precio referencial en soles peruanos.</p>

              <div className="mt-4 border-t border-border pt-4">
                <ServiceDetailActions
                  service={{
                    id: service.id,
                    title: service.title,
                    userId: service.userId,
                    coverImageUrl: service.coverImageUrl,
                    price: service.price,
                    previousPrice: service.previousPrice,
                    category: service.category,
                    tags: service.tags,
                    deliveryTime: service.deliveryTime,
                    profile: profile
                      ? {
                          displayName: profile.displayName,
                          avatarUrl: profile.avatarUrl,
                        }
                      : undefined,
                  }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-white p-5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="size-4 text-primary" aria-hidden />
                Compra con confianza
              </p>
              <p className="mt-2 text-sm text-muted">
                Revisa el perfil, conversa antes de contratar y reporta cualquier señal de
                estafa.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/explorar"
                  className="inline-flex rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary no-underline transition hover:bg-primary/5"
                >
                  Seguir explorando
                </Link>
                {profile ? (
                  <Link
                    href={sellerProfileHref}
                    className="inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white no-underline transition hover:opacity-95"
                  >
                    Ver perfil del vendedor
                  </Link>
                ) : null}
              </div>
            </div>
          </aside>
        </div>

        {sellerServices.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground">Más de este vendedor</h2>
            <p className="mt-1 text-sm text-muted">
              Más publicaciones activas de {profile?.displayName ?? "este perfil"}.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {sellerServices.map((item) => (
                <ServiceCard key={item.id} service={item} />
              ))}
            </div>
          </section>
        ) : null}

        {similarServices.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground">Servicios similares para ti</h2>
            <p className="mt-1 text-sm text-muted">
              Recomendaciones según esta categoría y etiquetas.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {similarServices.map((item) => (
                <ServiceCard key={item.id} service={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
