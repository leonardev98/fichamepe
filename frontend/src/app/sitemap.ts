import type { MetadataRoute } from "next";
import { searchProfilesCached } from "@/lib/api/profiles-search.server";
import { fetchOpenClientRequestsForSitemap } from "@/lib/api/public-client-requests.server";
import { fetchServiceSitemapEntries } from "@/lib/api/services.api";
import { SEO_SITE_URL } from "@/lib/seo";

const STATIC_PUBLIC_ROUTES = [
  "",
  "/explorar",
  "/solicitar",
  "/como-funciona",
  "/para-freelancers",
  "/preguntas-frecuentes",
  "/blog",
  "/sobre-nosotros",
  "/consejos",
  "/contacto",
  "/terminos",
  "/privacidad",
  "/planes-pro",
] as const;

async function fetchPublicProfileIds(limit = 100): Promise<string[]> {
  const first = await searchProfilesCached({}, 1, limit, 60 * 60 * 24);
  const ids = first.data.map((profile) => profile.id);
  const totalPages = Math.ceil((first.total || 0) / limit);
  if (totalPages <= 1) {
    return ids;
  }
  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, idx) =>
      searchProfilesCached({}, idx + 2, limit, 60 * 60 * 24),
    ),
  );
  for (const page of remainingPages) {
    for (const profile of page.data) {
      ids.push(profile.id);
    }
  }
  return ids;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [serviceEntries, clientRequests, publicProfileIds] = await Promise.all([
    fetchServiceSitemapEntries().catch(() => []),
    fetchOpenClientRequestsForSitemap().catch(() => []),
    fetchPublicProfileIds().catch(() => []),
  ]);

  const staticUrls: MetadataRoute.Sitemap = STATIC_PUBLIC_ROUTES.map((path) => ({
    url: `${SEO_SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const serviceUrls: MetadataRoute.Sitemap = serviceEntries.map((service) => ({
    url: `${SEO_SITE_URL}/servicios/${service.id}`,
    lastModified: new Date(service.updatedAt),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const requestUrls: MetadataRoute.Sitemap = clientRequests.map((request) => ({
    url: `${SEO_SITE_URL}/solicitar/${request.id}`,
    lastModified: new Date(request.createdAt),
    changeFrequency: "daily",
    priority: 0.85,
  }));

  const uniqueProfileIds = Array.from(new Set(publicProfileIds));
  const profileUrls: MetadataRoute.Sitemap = uniqueProfileIds.map((id) => ({
      url: `${SEO_SITE_URL}/perfil/${id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [...staticUrls, ...serviceUrls, ...requestUrls, ...profileUrls];
}
