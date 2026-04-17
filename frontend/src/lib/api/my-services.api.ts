import { api } from "@/lib/api";
import { enrichService } from "@/lib/service-enrichment";
import type { ServicePublic, ServiceStatus } from "@/types/service.types";

export type SkillFormDraft = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  deliveryMode: string;
  price: number;
  /** Precio habitual; null quita la oferta temporal. */
  listPrice?: number | null;
  /** Fin de oferta (ISO); null quita la oferta temporal. */
  promoEndsAt?: string | null;
  isFeatured?: boolean;
  deliveryTime: string;
  revisionsIncluded: string;
  coverImageUrl?: string | null;
  status: ServiceStatus;
};

function asServicePublic(raw: ServicePublic): ServicePublic {
  return {
    ...raw,
    createdAt:
      typeof raw.createdAt === "string" ? raw.createdAt : String(raw.createdAt ?? ""),
    updatedAt:
      typeof raw.updatedAt === "string" ? raw.updatedAt : String(raw.updatedAt ?? ""),
    status: raw.status ?? (raw.isActive ? "ACTIVA" : "PAUSADA"),
    isFeatured: raw.isFeatured ?? false,
    category: raw.category ?? "other",
    deliveryMode: raw.deliveryMode ?? "digital",
    deliveryTime: raw.deliveryTime ?? "A coordinar",
    revisionsIncluded: raw.revisionsIncluded ?? "0",
    moderationComment: raw.moderationComment ?? null,
    submittedAt: raw.submittedAt ?? null,
    reviewedAt: raw.reviewedAt ?? null,
    reviewedByUserId: raw.reviewedByUserId ?? null,
  };
}

export async function fetchMyPublications(): Promise<ServicePublic[]> {
  const { data } = await api.get<{ services: ServicePublic[] }>("/services/mine");
  return (data.services ?? []).map((s) => enrichService(asServicePublic(s)));
}

export async function fetchMyServiceById(id: string): Promise<ServicePublic> {
  const { data } = await api.get<ServicePublic>(`/services/mine/${id}`);
  return enrichService(asServicePublic(data));
}

export async function createSkillService(payload: SkillFormDraft): Promise<ServicePublic> {
  const { data } = await api.post<ServicePublic>("/services", payload);
  return enrichService(asServicePublic(data));
}

export async function updateSkillService(
  id: string,
  payload: Partial<SkillFormDraft>,
): Promise<ServicePublic> {
  const { data } = await api.patch<ServicePublic>(`/services/${id}`, payload);
  return enrichService(asServicePublic(data));
}

export async function pauseSkill(id: string): Promise<ServicePublic> {
  const { data } = await api.patch<ServicePublic>(`/services/${id}/pause`);
  return enrichService(asServicePublic(data));
}

export async function reactivateSkill(id: string): Promise<ServicePublic> {
  const { data } = await api.patch<ServicePublic>(`/services/${id}/reactivate`);
  return enrichService(asServicePublic(data));
}

export async function publishSkill(id: string): Promise<ServicePublic> {
  const { data } = await api.patch<ServicePublic>(`/services/${id}/publish`);
  return enrichService(asServicePublic(data));
}

export async function deleteSkill(id: string): Promise<void> {
  await api.delete(`/services/${id}`);
}
