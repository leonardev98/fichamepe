import "server-only";

import type { ServicePublic, ServicesFeedResponse } from "@/types/service.types";
import { mockServices } from "@/data/mockServices";
import { normalizeCountryCode } from "@/lib/country";
import { enrichService } from "@/lib/service-enrichment";

const SEO_REVALIDATE_SECONDS = 60 * 60 * 24;
const SERVICES_FEED_TAG = "services:feed";

function unwrapApiSuccess<T>(data: unknown): T {
  if (
    data !== null &&
    typeof data === "object" &&
    "success" in data &&
    (data as { success: unknown }).success === true &&
    "data" in data
  ) {
    return (data as { data: T }).data;
  }
  return data as T;
}

function getApiBaseUrl(): string {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL no está definido");
  }
  return base;
}

export type FetchFeedServicesParams = {
  limit?: number;
  offset?: number;
  orderBy?: "recent" | "popular" | "random";
  search?: string;
  tags?: string[];
  country?: string;
  featuredOnly?: boolean;
};

type ServerFetchOptions = {
  revalidateSeconds?: number;
  tags?: string[];
};

export async function fetchFeedServices(
  params: FetchFeedServicesParams = {},
  options: ServerFetchOptions = {},
): Promise<ServicesFeedResponse> {
  const sp = new URLSearchParams();
  sp.set("limit", String(params.limit ?? 12));
  sp.set("offset", String(params.offset ?? 0));
  sp.set("orderBy", params.orderBy ?? "random");
  if (params.search?.trim()) {
    sp.set("search", params.search.trim());
  }
  if (params.tags?.length) {
    for (const t of params.tags) {
      sp.append("tags", t);
    }
  }
  const normalizedCountry = normalizeCountryCode(params.country ?? null);
  if (normalizedCountry) {
    sp.set("country", normalizedCountry);
  }
  if (params.featuredOnly) {
    sp.set("featuredOnly", "true");
  }
  const url = `${getApiBaseUrl()}/services/feed?${sp.toString()}`;
  const tags = options.tags ?? [SERVICES_FEED_TAG];
  const res = await fetch(url, {
    next: {
      revalidate: options.revalidateSeconds ?? SEO_REVALIDATE_SECONDS,
      tags,
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`services/feed falló: ${res.status}`);
  }
  const json: unknown = await res.json();
  const data = unwrapApiSuccess<ServicesFeedResponse>(json);
  return {
    ...data,
    services: data.services.map(enrichService),
  };
}

/**
 * Detalle público (feed): solo servicios con estado ACTIVA en API.
 * 404 → null (inexistente, pausado por el vendedor o por moderación).
 */
export async function fetchServiceByIdOrNull(id: string): Promise<ServicePublic | null> {
  const url = `${getApiBaseUrl()}/services/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    next: {
      revalidate: SEO_REVALIDATE_SECONDS,
      tags: [SERVICES_FEED_TAG, `service:${id}`],
    },
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`services/${id} falló: ${res.status}`);
  }
  const json: unknown = await res.json();
  return enrichService(unwrapApiSuccess<ServicePublic>(json));
}

export async function fetchServiceById(id: string): Promise<ServicePublic> {
  const service = await fetchServiceByIdOrNull(id);
  if (!service) {
    throw new Error(`services/${id} no encontrado`);
  }
  return service;
}

export async function fetchServicesByProfileId(profileId: string): Promise<ServicePublic[]> {
  const url = `${getApiBaseUrl()}/services/profile/${encodeURIComponent(profileId)}`;
  const res = await fetch(url, {
    next: {
      revalidate: SEO_REVALIDATE_SECONDS,
      tags: [SERVICES_FEED_TAG, `profile:${profileId}:services`],
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`services/profile/${profileId} falló: ${res.status}`);
  }
  const json: unknown = await res.json();
  const data = unwrapApiSuccess<{ services: ServicePublic[] }>(json);
  return (data.services ?? []).map(enrichService);
}

export async function fetchFeedServicesSafe(
  params: FetchFeedServicesParams = {},
): Promise<ServicesFeedResponse> {
  try {
    return await fetchFeedServices(params);
  } catch {
    const limit = params.limit ?? 12;
    const offset = params.offset ?? 0;
    const services = mockServices.slice(offset, offset + limit).map((s) => enrichService(s));
    return {
      services,
      total: mockServices.length,
    };
  }
}

export type ServiceSitemapEntry = Pick<ServicePublic, "id" | "updatedAt">;

export async function fetchServiceSitemapEntries(
  pageSize = 40,
): Promise<ServiceSitemapEntry[]> {
  const safePageSize = Math.min(40, Math.max(1, Math.floor(pageSize)));
  const firstPage = await fetchFeedServices(
    { limit: safePageSize, offset: 0, orderBy: "recent" },
    { tags: [SERVICES_FEED_TAG, "sitemap:services"] },
  );
  const entries = firstPage.services.map((service) => ({
    id: service.id,
    updatedAt: service.updatedAt,
  }));
  const remaining = Math.max(0, firstPage.total - entries.length);

  if (remaining <= 0) {
    return entries;
  }

  const pageCount = Math.ceil(remaining / safePageSize);
  const pages = await Promise.all(
    Array.from({ length: pageCount }, (_, idx) =>
      fetchFeedServices(
        {
          limit: safePageSize,
          offset: (idx + 1) * safePageSize,
          orderBy: "recent",
        },
        { tags: [SERVICES_FEED_TAG, "sitemap:services"] },
      ),
    ),
  );
  for (const page of pages) {
    for (const service of page.services) {
      entries.push({ id: service.id, updatedAt: service.updatedAt });
    }
  }

  return entries;
}

/**
 * Feed de home: mezcla recientes + aleatorio (y popular si hace falta) para que no queden
 * fuera categorías con pocos anuncios nuevos cuando el catálogo crece.
 */
export async function fetchMergedHomeFeed(
  maxItems = 36,
  country?: string,
): Promise<{
  services: ServicePublic[];
}> {
  const chunk = Math.min(20, Math.max(12, Math.ceil(maxItems / 2)));
  const recent = await fetchFeedServicesSafe({
    limit: chunk,
    orderBy: "recent",
    country,
  });
  const random = await fetchFeedServicesSafe({
    limit: chunk,
    orderBy: "random",
    country,
  });
  const seen = new Set<string>();
  const out: ServicePublic[] = [];
  const pushUnique = (list: ServicePublic[]) => {
    for (const s of list) {
      if (out.length >= maxItems) return;
      if (seen.has(s.id)) continue;
      seen.add(s.id);
      out.push(s);
    }
  };
  pushUnique(recent.services);
  pushUnique(random.services);
  if (out.length < maxItems) {
    const popular = await fetchFeedServicesSafe({
      limit: maxItems - out.length,
      orderBy: "popular",
      country,
    });
    pushUnique(popular.services);
  }
  return { services: out };
}

