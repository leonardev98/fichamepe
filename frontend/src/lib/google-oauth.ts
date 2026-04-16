export type GoogleOAuthStartParams = {
  /** Ruta en el front (ej. `/dashboard`). Debe empezar por `/`. */
  from?: string | null;
  referral?: string | null;
  role?: "client" | "freelancer" | null;
};

/**
 * URL pública del API (misma que usa axios). Debe ser absoluta (`http://...` o `https://...`).
 * En Vercel/Railway debe existir en el entorno **al construir** el front (`NEXT_PUBLIC_*`).
 */
export function getPublicApiBaseUrl(): string | null {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/$/, "");
  if (!raw || !/^https?:\/\//i.test(raw)) {
    return null;
  }
  return raw;
}

/**
 * URL absoluta del backend que inicia el flujo OAuth con Google.
 * Tras el callback, el usuario vuelve a `/auth/google/callback` en el front.
 * Devuelve `null` si falta o es inválida `NEXT_PUBLIC_API_URL`.
 */
export function buildGoogleOAuthStartUrl(
  params?: GoogleOAuthStartParams,
): string | null {
  const base = getPublicApiBaseUrl();
  if (!base) {
    return null;
  }
  const u = new URL(`${base}/auth/google`);
  const from =
    typeof params?.from === "string" && params.from.startsWith("/")
      ? params.from
      : "/";
  u.searchParams.set("from", from);
  const ref = params?.referral?.trim();
  if (ref) {
    u.searchParams.set("referral", ref.toUpperCase());
  }
  if (params?.role === "client" || params?.role === "freelancer") {
    u.searchParams.set("role", params.role);
  }
  return u.toString();
}

/** Mensaje para mostrar si el front se desplegó sin `NEXT_PUBLIC_API_URL`. */
export const GOOGLE_OAUTH_MISSING_API_URL_MESSAGE =
  "Falta configurar NEXT_PUBLIC_API_URL en el hosting del front (URL absoluta del API, p. ej. https://tu-api.up.railway.app). Vuelve a desplegar después de añadirla.";
