"use client";

import { useEffect, useRef } from "react";
import { bootstrapSessionFromCookies } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

export function SessionBootstrap() {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const markBootstrapDone = () =>
      useAuthStore.getState().setAuthBootstrapComplete(true);

    if (useAuthStore.getState().accessToken) {
      void import("@/stores/favoritesStore").then(({ useFavoritesStore }) => {
        void useFavoritesStore.getState().syncFromApi();
      });
      void import("@/stores/conversationsStore").then(({ useConversationsStore }) => {
        void useConversationsStore.getState().syncFromApi();
      });
      void import("@/stores/notificationsStore").then(({ useNotificationsStore }) => {
        void useNotificationsStore.getState().syncFromApi();
      });
      markBootstrapDone();
      return;
    }
    void bootstrapSessionFromCookies()
      .then((ok) => {
        if (!ok) {
          // No usar `logout()`: haría POST /auth/logout y podría borrar cookies válidas si el fallo
          // fue distinto a "sin sesión" (p. ej. /auth/me temporal tras un refresh OK).
          useAuthStore.getState().clearClientSession();
          return;
        }
        void import("@/stores/favoritesStore").then(({ useFavoritesStore }) => {
          void useFavoritesStore.getState().syncFromApi();
        });
        void import("@/stores/conversationsStore").then(({ useConversationsStore }) => {
          void useConversationsStore.getState().syncFromApi();
        });
        void import("@/stores/notificationsStore").then(({ useNotificationsStore }) => {
          void useNotificationsStore.getState().syncFromApi();
        });
      })
      .finally(markBootstrapDone);
  }, []);
  return null;
}
