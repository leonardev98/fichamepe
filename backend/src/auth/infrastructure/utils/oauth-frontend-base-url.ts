import { ConfigService } from '@nestjs/config';

const MAX_ORIGIN_LEN = 200;

function normalizeOrigin(input: string): string | null {
  const s = input.trim().replace(/\/$/, '');
  if (!s || s.length > MAX_ORIGIN_LEN) {
    return null;
  }
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return null;
    }
    if (u.username || u.password) {
      return null;
    }
    return u.origin;
  } catch {
    return null;
  }
}

function expandWwwApexPairForOrigin(origin: string): string[] {
  try {
    const u = new URL(origin);
    const host = u.hostname;
    if (
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
    ) {
      return [u.origin];
    }
    const base = `${u.protocol}//`;
    const otherHost = host.startsWith('www.') ? host.slice(4) : `www.${host}`;
    const a = `${base}${host}`;
    const b = `${base}${otherHost}`;
    return a === b ? [a] : [a, b];
  } catch {
    return [];
  }
}

/**
 * Orígenes permitidos para redirigir tras OAuth (misma política que CORS explícito + FRONTEND_URL).
 * Si CORS es `*` o vacío, solo se confía en FRONTEND_URL.
 */
export function listOAuthSafeReturnOrigins(config: ConfigService): Set<string> {
  const set = new Set<string>();
  const fe = config.get<string>('FRONTEND_URL')?.trim();
  if (fe) {
    const o = normalizeOrigin(fe);
    if (o) {
      set.add(o);
    }
  }
  const rawCors = config.get<string>('CORS_ORIGIN')?.trim();
  if (!rawCors || rawCors === '*') {
    return set;
  }
  if (rawCors.includes(',')) {
    for (const part of rawCors.split(',')) {
      const o = normalizeOrigin(part.trim());
      if (o) {
        set.add(o);
      }
    }
    return set;
  }
  for (const e of expandWwwApexPairForOrigin(rawCors)) {
    set.add(e);
  }
  return set;
}

export function isOAuthReturnOriginAllowed(
  config: ConfigService,
  candidate: string | undefined,
): boolean {
  if (!candidate?.trim()) {
    return false;
  }
  const o = normalizeOrigin(candidate);
  if (!o) {
    return false;
  }
  return listOAuthSafeReturnOrigins(config).has(o);
}

/**
 * Base URL del front (sin barra final) tras login con Google.
 * Si el estado OAuth incluye un origen permitido (p. ej. el `Origin` del GET inicial), se usa;
 * si no, `FRONTEND_URL` o `http://localhost:3000`.
 */
export function resolveOAuthFrontendBaseUrl(
  config: ConfigService,
  stateOrigin: string | undefined,
): string {
  const defaultFe = (
    config.get<string>('FRONTEND_URL')?.trim() || 'http://localhost:3000'
  ).replace(/\/$/, '');
  if (stateOrigin && isOAuthReturnOriginAllowed(config, stateOrigin)) {
    return stateOrigin.replace(/\/$/, '');
  }
  return defaultFe;
}
