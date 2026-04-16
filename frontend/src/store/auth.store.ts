"use client";

import { create } from "zustand";
import type { AuthUser } from "@/types/auth";
import { normalizeAuthUser } from "@/lib/normalize-auth-user";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True tras el primer intento de `SessionBootstrap` (éxito o no). Rutas protegidas en cliente lo esperan. */
  authBootstrapComplete: boolean;
  login: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  setAuthBootstrapComplete: (complete: boolean) => void;
  /** Solo estado local (p. ej. bootstrap fallido); no llama al API ni borra cookies httpOnly. */
  clearClientSession: () => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setLoading: (isLoading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  authBootstrapComplete: false,
  setAuthBootstrapComplete: (complete) => set({ authBootstrapComplete: complete }),
  login: (accessToken, user) => {
    set({
      accessToken,
      user: normalizeAuthUser({
        ...user,
        avatarUrl: user.avatarUrl ?? null,
        referralCode: user.referralCode ?? "",
        hasReferredBy: user.hasReferredBy ?? false,
        publicationCount: user.publicationCount ?? 0,
        publicationActiveCount: user.publicationActiveCount ?? user.publicationCount ?? 0,
        publicationActiveMax: user.publicationActiveMax ?? user.publicationMax ?? null,
        publicationBaseActiveMax: user.publicationBaseActiveMax ?? null,
        publicationMax: user.publicationMax ?? null,
        isPublicationExempt: user.isPublicationExempt ?? false,
        referralDirectCount: user.referralDirectCount ?? 0,
        referralSlotsEarned: user.referralSlotsEarned ?? 0,
        purchasedPublicationSlots: user.purchasedPublicationSlots ?? 0,
      } as AuthUser),
      isAuthenticated: true,
    });
    void import("@/stores/conversationsStore").then(({ useConversationsStore }) => {
      void useConversationsStore.getState().syncFromApi();
    });
  },
  setAccessToken: (accessToken) =>
    set({ accessToken, isAuthenticated: !!accessToken }),
  clearClientSession: () => {
    const hadSession = get().isAuthenticated || !!get().accessToken;
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    if (hadSession) {
      void import("@/stores/favoritesStore").then(({ useFavoritesStore }) => {
        useFavoritesStore.getState().reset();
      });
      void import("@/stores/conversationsStore").then(({ useConversationsStore }) => {
        useConversationsStore.getState().reset();
      });
    }
  },
  logout: () => {
    const hadSession = get().isAuthenticated || !!get().accessToken;
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      authBootstrapComplete: true,
    });
    if (hadSession) {
      void import("@/stores/favoritesStore").then(({ useFavoritesStore }) => {
        useFavoritesStore.getState().reset();
      });
      void import("@/stores/conversationsStore").then(({ useConversationsStore }) => {
        useConversationsStore.getState().reset();
      });
    }
    void import("@/lib/api").then(({ api }) =>
      api.post("/auth/logout", {}, { skipAuthRefresh: true }).catch(() => {}),
    );
  },
  setUser: (user) =>
    set({
      user: normalizeAuthUser({
        ...user,
        avatarUrl: user.avatarUrl ?? null,
        referralCode: user.referralCode ?? "",
        hasReferredBy: user.hasReferredBy ?? false,
        publicationCount: user.publicationCount ?? 0,
        publicationActiveCount: user.publicationActiveCount ?? user.publicationCount ?? 0,
        publicationActiveMax: user.publicationActiveMax ?? user.publicationMax ?? null,
        publicationBaseActiveMax: user.publicationBaseActiveMax ?? null,
        publicationMax: user.publicationMax ?? null,
        isPublicationExempt: user.isPublicationExempt ?? false,
        referralDirectCount: user.referralDirectCount ?? 0,
        referralSlotsEarned: user.referralSlotsEarned ?? 0,
        purchasedPublicationSlots: user.purchasedPublicationSlots ?? 0,
      } as AuthUser),
    }),
  setLoading: (isLoading) => set({ isLoading }),
}));
