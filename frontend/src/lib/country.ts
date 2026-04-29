export const COUNTRY_COOKIE_NAME = "fm_country";

/** Países disponibles en el selector del navbar y filtro de publicaciones. */
export const NAVBAR_CONTENT_COUNTRY_CODES = [
  "PE",
  "MX",
  "AR",
  "CO",
  "CL",
  "EC",
] as const;

const NAVBAR_CONTENT_SET = new Set<string>(NAVBAR_CONTENT_COUNTRY_CODES);

const NAVBAR_LABELS_ES: Record<(typeof NAVBAR_CONTENT_COUNTRY_CODES)[number], string> = {
  PE: "Perú",
  MX: "México",
  AR: "Argentina",
  CO: "Colombia",
  CL: "Chile",
  EC: "Ecuador",
};

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
const EXCLUDED_CODES = new Set(["XX", "ZZ"]);

export type CountryOption = {
  code: string;
  label: string;
};

export function countryCodeToFlagEmoji(countryCode: string): string {
  const normalized = normalizeCountryCode(countryCode);
  if (!normalized) {
    return "🌐";
  }
  const codePoints = [...normalized].map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function getCountryFlagIconUrl(countryCode: string): string | null {
  const normalized = normalizeCountryCode(countryCode);
  if (!normalized) {
    return null;
  }
  return `https://flagcdn.com/${normalized.toLowerCase()}.svg`;
}

export function normalizeCountryCode(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  if (!COUNTRY_CODE_PATTERN.test(normalized)) {
    return null;
  }
  if (EXCLUDED_CODES.has(normalized)) {
    return null;
  }
  return normalized;
}

export function isNavbarContentCountryCode(code: string | null | undefined): boolean {
  const normalized = normalizeCountryCode(code ?? null);
  if (!normalized) {
    return false;
  }
  return NAVBAR_CONTENT_SET.has(normalized);
}

/** Solo códigos permitidos en el selector; el resto se trata como «sin filtro». */
export function sanitizeContentCountryFilter(
  value: string | null | undefined,
): string | null {
  const normalized = normalizeCountryCode(value ?? null);
  if (!normalized || !NAVBAR_CONTENT_SET.has(normalized)) {
    return null;
  }
  return normalized;
}

function readHeaderValue(headers: Headers, key: string): string | null {
  const value = headers.get(key);
  if (!value) {
    return null;
  }
  const first = value.split(",")[0]?.trim();
  return first && first.length > 0 ? first : null;
}

export function detectCountryCodeFromHeaders(headers: Headers): string | null {
  const candidates = [
    readHeaderValue(headers, "cf-ipcountry"),
    readHeaderValue(headers, "x-vercel-ip-country"),
    readHeaderValue(headers, "x-country-code"),
    readHeaderValue(headers, "x-geo-country"),
    readHeaderValue(headers, "x-geo-country-code"),
  ];
  for (const candidate of candidates) {
    const normalized = normalizeCountryCode(candidate);
    if (normalized) {
      return normalized;
    }
  }
  return null;
}

export function readCountryCookieFromDocument(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const key = `${COUNTRY_COOKIE_NAME}=`;
  const chunk = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(key));
  if (!chunk) {
    return null;
  }
  return normalizeCountryCode(decodeURIComponent(chunk.slice(key.length)));
}

export function writeCountryCookie(value: string): void {
  if (typeof document === "undefined") {
    return;
  }
  const code = normalizeCountryCode(value);
  if (!code) {
    return;
  }
  const maxAgeSeconds = 60 * 60 * 24 * 365;
  document.cookie = `${COUNTRY_COOKIE_NAME}=${encodeURIComponent(code)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

/** Quita el país guardado en cookie (vista sin filtro por país). */
export function clearCountryCookie(): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${COUNTRY_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export function getCountryOptions(locale = "es"): CountryOption[] {
  try {
    if (typeof Intl !== "undefined" && typeof Intl.DisplayNames !== "undefined") {
      const displayNames = new Intl.DisplayNames([locale], { type: "region" });
      return NAVBAR_CONTENT_COUNTRY_CODES.map((code) => ({
        code,
        label: displayNames.of(code) ?? NAVBAR_LABELS_ES[code],
      }));
    }
  } catch {
    // Intl no disponible
  }
  return NAVBAR_CONTENT_COUNTRY_CODES.map((code) => ({
    code,
    label: NAVBAR_LABELS_ES[code],
  }));
}
