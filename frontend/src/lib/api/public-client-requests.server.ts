import "server-only";

import type {
  ClientRequestDetailPublic,
  ClientRequestPublic,
} from "@/types/client-request.types";

const SEO_REVALIDATE_SECONDS = 60 * 60 * 24;
const CLIENT_REQUESTS_TAG = "client-requests:open";

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

export async function fetchPublicClientRequestById(
  id: string,
): Promise<ClientRequestDetailPublic | null> {
  const url = `${getApiBaseUrl()}/client-requests/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    next: {
      revalidate: SEO_REVALIDATE_SECONDS,
      tags: [CLIENT_REQUESTS_TAG, `client-request:${id}`],
    },
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`client-requests/${id} falló: ${res.status}`);
  }
  const json: unknown = await res.json();
  return unwrapApiSuccess<ClientRequestDetailPublic>(json);
}

export async function fetchOpenClientRequestsForSitemap(
  limit = 50,
): Promise<ClientRequestPublic[]> {
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit)));
  const url = `${getApiBaseUrl()}/client-requests?limit=${safeLimit}`;
  const res = await fetch(url, {
    next: {
      revalidate: SEO_REVALIDATE_SECONDS,
      tags: [CLIENT_REQUESTS_TAG, "sitemap:client-requests"],
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`client-requests falló: ${res.status}`);
  }
  const json: unknown = await res.json();
  return unwrapApiSuccess<ClientRequestPublic[]>(json);
}
