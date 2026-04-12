import { api } from "@/lib/api";
import type { Profile, SearchFilters } from "@/types/profile.types";

type SearchProfilesApiRow = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  district: string | null;
  hourlyRate: string | null;
  isAvailable: boolean;
  skills: { id: string; name: string; category: string }[];
};

type SearchProfilesResponse = {
  data: SearchProfilesApiRow[];
  total: number;
  page: number;
  limit: number;
};

function mapProfile(row: SearchProfilesApiRow): Profile {
  const n =
    row.hourlyRate != null && row.hourlyRate !== ""
      ? Number.parseFloat(row.hourlyRate)
      : NaN;
  return {
    id: row.id,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    bio: row.bio,
    district: row.district,
    hourlyRate: Number.isFinite(n) ? n : null,
    isAvailable: row.isAvailable,
    skills: row.skills ?? [],
  };
}

function appendSearchParams(
  sp: URLSearchParams,
  filters: SearchFilters,
  page: number,
  limit: number,
) {
  const skills = filters.skill
    ? Array.isArray(filters.skill)
      ? filters.skill
      : [filters.skill]
    : [];
  for (const id of skills) {
    if (id) sp.append("skill", id);
  }
  if (filters.district?.trim()) {
    sp.set("district", filters.district.trim());
  }
  if (filters.isAvailable === true) {
    sp.set("isAvailable", "true");
  }
  if (filters.maxHourlyRate !== undefined) {
    sp.set("maxHourlyRate", String(filters.maxHourlyRate));
  }
  if (filters.search?.trim()) {
    sp.set("search", filters.search.trim());
  }
  if (filters.category?.trim()) {
    sp.set("category", filters.category.trim());
  }
  sp.set("page", String(page));
  sp.set("limit", String(limit));
}

export async function searchProfiles(
  filters: SearchFilters,
  page: number,
  limit: number,
): Promise<{
  data: Profile[];
  total: number;
  page: number;
  limit: number;
}> {
  const sp = new URLSearchParams();
  appendSearchParams(sp, filters, page, limit);
  const res = await api.get<SearchProfilesResponse>(
    `/profiles/search?${sp.toString()}`,
  );
  const body = res.data;
  return {
    data: (body.data ?? []).map(mapProfile),
    total: body.total ?? 0,
    page: body.page ?? page,
    limit: body.limit ?? limit,
  };
}
