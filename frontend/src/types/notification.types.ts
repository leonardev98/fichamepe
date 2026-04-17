export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  linkPath: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationNewSocketPayload = {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  unreadCount: number;
};
