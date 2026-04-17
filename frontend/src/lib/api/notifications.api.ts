import { api } from "@/lib/api";
import type { AppNotification } from "@/types/notification.types";

export async function fetchNotificationsUnreadCount(): Promise<number> {
  const { data } = await api.get<{ unreadCount: number }>("/notifications/unread-count");
  return data.unreadCount;
}

export async function fetchNotifications(
  limit = 20,
  offset = 0,
): Promise<{ items: AppNotification[]; total: number }> {
  const { data } = await api.get<{ items: AppNotification[]; total: number }>(
    "/notifications",
    { params: { limit, offset } },
  );
  return data;
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const { data } = await api.patch<AppNotification>(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  const { data } = await api.post<{ updated: number }>("/notifications/read-all");
  return data;
}
