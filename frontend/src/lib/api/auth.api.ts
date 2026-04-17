import { api } from "@/lib/api";
import { normalizeCountryCode } from "@/lib/country";
import { normalizeAuthUser } from "@/lib/normalize-auth-user";
import type { AuthUser } from "@/types/auth";

export { normalizeAuthUser } from "@/lib/normalize-auth-user";

export function parseApiErrorMessage(e: unknown, fallback: string): string {
  if (typeof e !== "object" || e === null || !("response" in e)) {
    return fallback;
  }
  const data = (e as { response?: { data?: unknown } }).response?.data;
  if (!data || typeof data !== "object") {
    return fallback;
  }
  const d = data as { message?: unknown; detail?: unknown };
  const detail = typeof d.detail === "string" && d.detail.length ? d.detail : undefined;
  const raw = d.message;
  let msg: string | undefined;
  if (typeof raw === "string") msg = raw;
  else if (Array.isArray(raw)) msg = raw.join(", ");
  if (detail && (msg === "Error interno del servidor" || !msg)) {
    return detail;
  }
  if (msg) return msg;
  if (detail) return detail;
  return fallback;
}

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  /** Si no se envía, el backend asigna rol por defecto (freelancer). */
  role?: "client" | "freelancer";
  referralCode?: string;
};

/** POST /auth/register — respuesta del backend (cookies de refresh las maneja axios). */
export async function registerAccount(
  payload: RegisterPayload,
): Promise<{ accessToken: string; user: AuthUser }> {
  const body: Record<string, unknown> = {
    fullName: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  };
  if (payload.role !== undefined) {
    body.role = payload.role;
  }
  const ref = payload.referralCode?.trim();
  if (ref) {
    body.referralCode = ref.toUpperCase();
  }
  const { data } = await api.post<{ accessToken: string; user: AuthUser }>(
    "/auth/register",
    body,
  );
  const u = data.user;
  return {
    accessToken: data.accessToken,
    user: normalizeAuthUser({
      ...u,
      countryCode: normalizeCountryCode(u.countryCode ?? null),
      avatarUrl: u.avatarUrl ?? null,
      referralCode: u.referralCode ?? "",
      hasReferredBy: u.hasReferredBy ?? false,
      publicationCount: u.publicationCount ?? 0,
      publicationActiveCount: u.publicationActiveCount ?? u.publicationCount ?? 0,
      publicationActiveMax: u.publicationActiveMax ?? u.publicationMax ?? null,
      publicationBaseActiveMax: u.publicationBaseActiveMax ?? null,
      publicationMax: u.publicationMax ?? null,
      isPublicationExempt: u.isPublicationExempt ?? false,
      featuredActiveCount: u.featuredActiveCount ?? 0,
      featuredActiveMax: u.featuredActiveMax ?? u.referralDirectCount ?? 0,
      referralDirectCount: u.referralDirectCount ?? 0,
      referralSlotsEarned: u.referralSlotsEarned ?? 0,
      purchasedPublicationSlots: u.purchasedPublicationSlots ?? 0,
    } as AuthUser),
  };
}

/** POST /auth/login */
export async function postLogin(
  email: string,
  password: string,
): Promise<{ accessToken: string }> {
  const { data } = await api.post<{ accessToken: string }>("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });
  return data;
}

/** GET /auth/me (requiere Bearer ya configurado en el cliente). */
export async function fetchAuthMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/auth/me");
  return normalizeAuthUser({
    ...data,
    countryCode: normalizeCountryCode(data.countryCode ?? null),
    avatarUrl: data.avatarUrl ?? null,
    referralCode: data.referralCode ?? "",
    hasReferredBy: data.hasReferredBy ?? false,
    publicationCount: data.publicationCount ?? 0,
    publicationActiveCount: data.publicationActiveCount ?? data.publicationCount ?? 0,
    publicationActiveMax: data.publicationActiveMax ?? data.publicationMax ?? null,
    publicationBaseActiveMax: data.publicationBaseActiveMax ?? null,
    publicationMax: data.publicationMax ?? null,
    isPublicationExempt: data.isPublicationExempt ?? false,
    featuredActiveCount: data.featuredActiveCount ?? 0,
    featuredActiveMax: data.featuredActiveMax ?? data.referralDirectCount ?? 0,
    referralDirectCount: data.referralDirectCount ?? 0,
    referralSlotsEarned: data.referralSlotsEarned ?? 0,
    purchasedPublicationSlots: data.purchasedPublicationSlots ?? 0,
  } as AuthUser);
}

export async function postVerifyEmail(token: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/auth/verify-email", {
    token: token.trim(),
  });
  return data;
}

export async function postResendVerificationEmail(): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/auth/resend-verification", {});
  return data;
}

export type ForgotPasswordResponse = {
  message: string;
  /** Solo fuera de producción (o PASSWORD_RESET_DEV_LINK) si el correo existe. */
  resetToken?: string;
};

/** POST /auth/forgot-password */
export async function postForgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const { data } = await api.post<ForgotPasswordResponse>("/auth/forgot-password", {
    email: email.trim().toLowerCase(),
  });
  return data;
}

/** POST /auth/reset-password */
export async function postResetPassword(token: string, newPassword: string): Promise<void> {
  await api.post("/auth/reset-password", { token, newPassword });
}
