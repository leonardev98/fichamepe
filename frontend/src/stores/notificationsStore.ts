"use client";

import { create } from "zustand";
import {
  fetchNotifications,
  fetchNotificationsUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications.api";
import { useAuthStore } from "@/store/auth.store";
import type { AppNotification, NotificationNewSocketPayload } from "@/types/notification.types";

type NotificationsState = {
  items: AppNotification[];
  total: number;
  unreadCount: number;
  syncFromApi: () => Promise<void>;
  loadMore: () => Promise<void>;
  applySocketNew: (payload: NotificationNewSocketPayload) => void;
  markOneRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  total: 0,
  unreadCount: 0,

  reset: () => set({ items: [], total: 0, unreadCount: 0 }),

  syncFromApi: async () => {
    if (!useAuthStore.getState().accessToken) return;
    try {
      const [list, unreadCount] = await Promise.all([
        fetchNotifications(30, 0),
        fetchNotificationsUnreadCount(),
      ]);
      set({ items: list.items, total: list.total, unreadCount });
    } catch {
      /* backend caído: no romper UI */
    }
  },

  loadMore: async () => {
    if (!useAuthStore.getState().accessToken) return;
    const { items, total } = get();
    if (items.length >= total) return;
    try {
      const res = await fetchNotifications(20, items.length);
      set((state) => {
        const ids = new Set(state.items.map((i) => i.id));
        const extra = res.items.filter((i) => !ids.has(i.id));
        return {
          items: [...state.items, ...extra],
          total: res.total,
        };
      });
    } catch {
      /* ignore */
    }
  },

  applySocketNew: (payload) => {
    set((state) => {
      if (state.items.some((i) => i.id === payload.id)) {
        return { unreadCount: payload.unreadCount };
      }
      const row: AppNotification = {
        id: payload.id,
        type: payload.type,
        title: payload.title,
        body: null,
        linkPath: null,
        readAt: null,
        createdAt: payload.createdAt,
      };
      return {
        items: [row, ...state.items].slice(0, 60),
        total: state.total + 1,
        unreadCount: payload.unreadCount,
      };
    });
  },

  markOneRead: async (id) => {
    try {
      const updated = await markNotificationRead(id);
      const unreadCount = await fetchNotificationsUnreadCount();
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? updated : i)),
        unreadCount,
      }));
    } catch {
      void get().syncFromApi();
    }
  },

  markAllRead: async () => {
    try {
      await markAllNotificationsRead();
      const unreadCount = await fetchNotificationsUnreadCount();
      const now = new Date().toISOString();
      set((state) => ({
        items: state.items.map((i) => (i.readAt ? i : { ...i, readAt: now })),
        unreadCount,
      }));
    } catch {
      void get().syncFromApi();
    }
  },
}));
