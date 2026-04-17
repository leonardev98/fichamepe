import { api } from "@/lib/api";
import type { AdminClientRequestQueueItem } from "@/types/client-request.types";

export async function fetchAdminClientRequestReviewQueue(): Promise<{
  requests: AdminClientRequestQueueItem[];
}> {
  const { data } = await api.get<{ requests: AdminClientRequestQueueItem[] }>(
    "/admin/client-requests/review-queue",
  );
  return data;
}

export async function approveAdminClientRequest(id: string): Promise<void> {
  await api.patch(`/admin/client-requests/${id}/approve`, {});
}

export async function requestAdminClientRequestChanges(
  id: string,
  comment: string,
): Promise<void> {
  await api.patch(`/admin/client-requests/${id}/request-changes`, { comment });
}
