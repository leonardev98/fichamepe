import { api } from "@/lib/api";
import type {
  ModerationReportReason,
  ModerationTargetType,
  AdminModerationReportItem,
} from "@/types/moderation.types";

export type CreateModerationReportPayload = {
  targetType: ModerationTargetType;
  targetId: string;
  reason: ModerationReportReason;
  details?: string;
};

export async function createModerationReport(
  payload: CreateModerationReportPayload,
): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>("/moderation-reports", payload);
  return data;
}

export async function fetchAdminModerationReports(params: {
  reviewStatus?: "pending" | "dismissed" | "actioned" | "all";
  targetType?: ModerationTargetType;
  limit?: number;
  offset?: number;
}): Promise<{ reports: AdminModerationReportItem[]; total: number }> {
  const { data } = await api.get<{ reports: AdminModerationReportItem[]; total: number }>(
    "/admin/moderation-reports",
    { params },
  );
  return data;
}

export async function dismissAdminModerationReport(
  id: string,
  body?: { reviewNote?: string },
): Promise<{ ok: true }> {
  const { data } = await api.patch<{ ok: true }>(
    `/admin/moderation-reports/${id}/dismiss`,
    body ?? {},
  );
  return data;
}

export async function applyAdminModerationReport(
  id: string,
  body?: { reviewNote?: string },
): Promise<{ ok: true }> {
  const { data } = await api.patch<{ ok: true }>(
    `/admin/moderation-reports/${id}/apply`,
    body ?? {},
  );
  return data;
}
