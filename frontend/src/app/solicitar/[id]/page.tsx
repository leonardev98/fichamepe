import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublicClientRequestById } from "@/lib/api/public-client-requests.server";
import { SEO_DEFAULT_OG_IMAGE, SEO_SITE_NAME, truncateText } from "@/lib/seo";
import { SolicitarDetalleClient } from "./SolicitarDetalleClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const request = await fetchPublicClientRequestById(id).catch(() => null);
  if (!request) {
    return {
      title: "Solicitud no disponible",
      description: "Esta solicitud ya no está disponible o fue retirada.",
      alternates: {
        canonical: `/solicitar/${id}`,
      },
      robots: { index: false, follow: false },
    };
  }
  const description = truncateText(
    request.detail ??
      `Solicitud publicada en FichaMePe con presupuesto ${request.budget}.`,
    160,
  );
  const title = `${request.title} (${request.budget})`;
  return {
    title,
    description,
    keywords: [
      "solicitud de cliente",
      request.budget,
      "postular freelance",
      ...request.title.toLowerCase().split(/\s+/).slice(0, 5),
    ],
    alternates: {
      canonical: `/solicitar/${request.id}`,
    },
    openGraph: {
      type: "article",
      locale: "es_PE",
      siteName: SEO_SITE_NAME,
      title: `${title} | ${SEO_SITE_NAME}`,
      description,
      url: `/solicitar/${request.id}`,
      publishedTime: request.createdAt,
      images: [
        {
          url: SEO_DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: request.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SEO_SITE_NAME}`,
      description,
      images: [SEO_DEFAULT_OG_IMAGE],
    },
  };
}

export default async function SolicitarDetallePage({ params }: PageProps) {
  const { id } = await params;
  const detail = await fetchPublicClientRequestById(id).catch(() => null);

  if (!detail) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: detail.title,
    description: detail.detail ?? `Solicitud con presupuesto ${detail.budget}`,
    datePublished: detail.createdAt,
    inLanguage: "es-PE",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://fichame.pe/solicitar/${detail.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SolicitarDetalleClient id={id} initialDetail={detail} />
    </>
  );
}
