export const COUNTRY_COOKIE_NAME = "fm_country";

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
const EXCLUDED_CODES = new Set(["XX", "ZZ"]);
const FALLBACK_COUNTRY_CODES = [
  "PE",
  "AR",
  "BO",
  "BR",
  "CL",
  "CO",
  "EC",
  "MX",
  "PY",
  "UY",
  "VE",
  "US",
  "CA",
  "ES",
];

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

export function getCountryOptions(locale = "es"): CountryOption[] {
  const codes = getAllCountryCodes();
  const displayNames = new Intl.DisplayNames([locale], { type: "region" });
  return codes
    .map((code) => ({
      code,
      label: displayNames.of(code) ?? code,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}

function getAllCountryCodes(): string[] {
  if (typeof Intl === "undefined") {
    return FALLBACK_COUNTRY_CODES;
  }

  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    const detected: string[] = [];
    for (let first = 65; first <= 90; first += 1) {
      for (let second = 65; second <= 90; second += 1) {
        const code = String.fromCharCode(first, second);
        const normalized = normalizeCountryCode(code);
        if (!normalized) {
          continue;
        }
        const label = names.of(normalized);
        if (!label || label === normalized) {
          continue;
        }
        detected.push(normalized);
      }
    }
    if (detected.length > 0) {
      return detected;
    }
  } catch {
    // Si Intl.DisplayNames no está disponible en el runtime, usamos fallback.
  }

  return FALLBACK_COUNTRY_CODES;
}
