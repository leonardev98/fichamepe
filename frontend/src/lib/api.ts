import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import type { AuthUser } from "@/types/auth";
import { normalizeAuthUser } from "@/lib/normalize-auth-user";
import { useAuthStore } from "@/store/auth.store";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Evita reintentos con refresh (logout, login, etc.). */
    skipAuthRefresh?: boolean;
  }
}

const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

function unwrapApiSuccess<T>(data: unknown): T {
  if (
    data !== null &&
    typeof data === "object" &&
    "success" in data &&
    (data as { success: unknown }).success === true &&
    "data" in data
  ) {
    return (data as { data: T }).data;
  }
  return data as T;
}

function attachSuccessUnwrap(client: AxiosInstance) {
  client.interceptors.response.use((response) => {
    response.data = unwrapApiSuccess(response.data);
    return response;
  });
}

attachSuccessUnwrap(api);
attachSuccessUnwrap(refreshClient);

let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<{ accessToken: string }>("/auth/refresh", {})
      .then((res) => res.data.accessToken)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (!original) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = String(original.url ?? "");

    if (original.skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (
      status !== 401 ||
      original._retry ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const newToken = await refreshAccessToken();
      useAuthStore.getState().setAccessToken(newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }
  },
);

/** Restaura access + user usando la cookie httpOnly de refresh (sin Bearer previo). */
export async function bootstrapSessionFromCookies(): Promise<boolean> {
  try {
    const { data } = await refreshClient.post<{ accessToken: string }>(
      "/auth/refresh",
      {},
    );
    useAuthStore.getState().setAccessToken(data.accessToken);
    const { data: user } = await api.get<AuthUser>("/auth/me");
    useAuthStore.setState({
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
        featuredActiveCount: user.featuredActiveCount ?? 0,
        featuredActiveMax: user.featuredActiveMax ?? user.referralDirectCount ?? 0,
        referralDirectCount: user.referralDirectCount ?? 0,
        referralSlotsEarned: user.referralSlotsEarned ?? 0,
        purchasedPublicationSlots: user.purchasedPublicationSlots ?? 0,
      } as AuthUser),
      isAuthenticated: true,
    });
    return true;
  } catch {
    return false;
  }
}
