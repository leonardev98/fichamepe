"use client";

import { create } from "zustand";
import type { AuthUser } from "@/types/auth";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setLoading: (isLoading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  login: (accessToken, user) =>
    set({
      accessToken,
      user,
      isAuthenticated: true,
    }),
  setAccessToken: (accessToken) =>
    set({ accessToken, isAuthenticated: !!accessToken }),
  logout: () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    void import("@/lib/api").then(({ api }) =>
      api.post("/auth/logout", {}, { skipAuthRefresh: true }).catch(() => {}),
    );
  },
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
