import "server-only";

import type { PublicProfile } from "@/types/profile.types";

const SEO_REVALIDATE_SECONDS = 60 * 60 * 24;

type PublicProfileApiRow = {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  district: string | null;
  hourlyRate: string | null;
  isAvailable: boolean;
  portfolioImages: string[] | null;
  skills: Array<{ id: string; name: string; category: string }>;
};

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

function mapPublicProfile(row: PublicProfileApiRow): PublicProfile {
  const parsedRate =
    row.hourlyRate != null && row.hourlyRate !== "" ? Number.parseFloat(row.hourlyRate) : NaN;

  return {
    id: row.id,
    userId: row.userId,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    bio: row.bio,
    district: row.district,
    hourlyRate: Number.isFinite(parsedRate) ? parsedRate : null,
    isAvailable: row.isAvailable,
    portfolioImages: row.portfolioImages,
    skills: row.skills ?? [],
  };
}

export async function fetchPublicProfileById(profileId: string): Promise<PublicProfile> {
  const base = getApiBaseUrl();
  const url = `${base}/profiles/${encodeURIComponent(profileId)}`;
  const res = await fetch(url, {
    next: {
      revalidate: SEO_REVALIDATE_SECONDS,
      tags: [`profile:${profileId}`, "profiles:public"],
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`profiles/${profileId} falló: ${res.status}`);
  }

  const json: unknown = await res.json();
  return mapPublicProfile(unwrapApiSuccess<PublicProfileApiRow>(json));
}
