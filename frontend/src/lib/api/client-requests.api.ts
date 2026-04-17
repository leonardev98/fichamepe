import { api } from "@/lib/api";
import type {
  ClientRequestCommentPublic,
  ClientRequestCommentsPage,
  ClientRequestCreated,
  ClientRequestDetailPublic,
  ClientRequestPublic,
  MyClientRequestRow,
} from "@/types/client-request.types";

export async function fetchOpenClientRequests(limit = 30): Promise<ClientRequestPublic[]> {
  const { data } = await api.get<ClientRequestPublic[]>("/client-requests", {
    params: { limit },
  });
  return data;
}

export async function fetchPublicClientRequest(id: string): Promise<ClientRequestDetailPublic> {
  const { data } = await api.get<ClientRequestDetailPublic>(`/client-requests/${id}`);
  return data;
}

export async function fetchMyClientRequests(
  status: "EN_REVISION" | "OPEN" | "REQUIERE_CAMBIOS" | "all" = "all",
): Promise<MyClientRequestRow[]> {
  const { data } = await api.get<MyClientRequestRow[]>("/client-requests/mine", {
    params: status === "all" ? {} : { status },
  });
  return data;
}

export async function updateClientRequest(
  id: string,
  payload: { title: string; detail?: string; budget: string },
): Promise<void> {
  await api.patch(`/client-requests/${id}`, payload);
}

export async function resubmitClientRequest(id: string): Promise<void> {
  await api.post(`/client-requests/${id}/resubmit`, {});
}

export async function fetchClientRequestComments(
  requestId: string,
  params: { limit?: number; offset?: number } = {},
): Promise<ClientRequestCommentsPage> {
  const { data } = await api.get<ClientRequestCommentsPage>(
    `/client-requests/${requestId}/comments`,
    { params },
  );
  return data;
}

export async function postClientRequestComment(
  requestId: string,
  body: string,
): Promise<ClientRequestCommentPublic> {
  const { data } = await api.post<ClientRequestCommentPublic>(
    `/client-requests/${requestId}/comments`,
    { body },
  );
  return data;
}

export async function createClientRequest(payload: {
  title: string;
  detail?: string;
  budget: string;
}): Promise<ClientRequestCreated> {
  const { data } = await api.post<ClientRequestCreated>("/client-requests", payload);
  return data;
}

export type ApplyToClientRequestResult = {
  id: string;
  requestId: string;
  applicantsCount: number;
};

export async function applyToClientRequest(
  requestId: string,
): Promise<ApplyToClientRequestResult> {
  const { data } = await api.post<ApplyToClientRequestResult>(
    `/client-requests/${requestId}/applications`,
    {},
  );
  return data;
}
