import type { Metadata } from "next";

export const SEO_SITE_URL = "https://fichame.pe";
export const SEO_SITE_NAME = "FichaMePe";
export const SEO_DEFAULT_DESCRIPTION =
  "Marketplace de talento freelance en Lima. Encuentra servicios, perfiles y solicitudes activas para contratar rápido y sin intermediarios.";
export const SEO_DEFAULT_OG_IMAGE =
  "https://fichamepe-assets-prod.s3.us-east-2.amazonaws.com/logo-fichamepe.png";
export const SEO_DEFAULT_KEYWORDS = [
  "freelancers en lima",
  "servicios freelance peru",
  "contratar freelancers",
  "publicaciones de servicios",
  "solicitudes de clientes",
] as const;

export function truncateText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image = SEO_DEFAULT_OG_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "es_PE",
      siteName: SEO_SITE_NAME,
      title: `${title} | ${SEO_SITE_NAME}`,
      description,
      url: path,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SEO_SITE_NAME}`,
      description,
      images: [image],
    },
  };
}
