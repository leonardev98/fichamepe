import type { Request } from 'express';

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

export function getRequestIp(req: Request): string {
  const xfwd = req.headers['x-forwarded-for'];
  const fromHeader = Array.isArray(xfwd) ? xfwd[0] : xfwd;
  const first =
    typeof fromHeader === 'string'
      ? fromHeader.split(',')[0]?.trim()
      : undefined;

  return (
    first ||
    // express populates req.ip when trust proxy is set; still a useful fallback
    (typeof req.ip === 'string' && req.ip.trim() ? req.ip.trim() : '') ||
    'unknown'
  );
}

export function getRequestUserAgent(req: Request): string {
  const ua = req.headers['user-agent'];
  if (Array.isArray(ua)) return ua.join(' ');
  if (typeof ua === 'string' && ua.trim()) return ua.trim();
  return 'unknown';
}

function firstHeaderValue(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') {
    return null;
  }
  const first = raw.split(',')[0]?.trim();
  return first && first.length > 0 ? first : null;
}

export function normalizeCountryCode(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  if (!COUNTRY_CODE_PATTERN.test(normalized)) {
    return null;
  }
  if (normalized === 'XX' || normalized === 'ZZ') {
    return null;
  }
  return normalized;
}

export function getRequestCountryCode(req: Request): string | null {
  const candidates = [
    firstHeaderValue(req.headers['cf-ipcountry']),
    firstHeaderValue(req.headers['x-vercel-ip-country']),
    firstHeaderValue(req.headers['x-country-code']),
    firstHeaderValue(req.headers['x-geo-country']),
    firstHeaderValue(req.headers['x-geo-country-code']),
  ];
  for (const candidate of candidates) {
    const normalized = normalizeCountryCode(candidate);
    if (normalized) {
      return normalized;
    }
  }
  return null;
}
