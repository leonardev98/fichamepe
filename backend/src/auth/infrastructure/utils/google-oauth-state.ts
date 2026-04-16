import { BadRequestException } from '@nestjs/common';

export type GoogleOAuthStatePayload = {
  /** Ruta interna (debe empezar por /). */
  from: string;
  referral?: string;
  role?: 'client' | 'freelancer';
  /**
   * Origen del front desde el que se inició OAuth (`Origin` del GET /auth/google),
   * solo si estaba en la lista permitida (FRONTEND_URL / CORS_ORIGIN explícito).
   */
  returnOrigin?: string;
};

const STATE_VERSION = 1;

type EncodedState = {
  v: typeof STATE_VERSION;
  from: string;
  referral?: string;
  role?: 'client' | 'freelancer';
  /** Origen permitido (scheme://host[:port]) */
  o?: string;
};

export function encodeGoogleOAuthState(
  payload: GoogleOAuthStatePayload,
): string {
  const from =
    payload.from?.startsWith('/') && !payload.from.startsWith('//')
      ? payload.from.slice(0, 512)
      : '/';
  const ro = payload.returnOrigin?.trim();
  const body: EncodedState = {
    v: STATE_VERSION,
    from,
    ...(payload.referral?.trim()
      ? { referral: payload.referral.trim().toUpperCase().slice(0, 16) }
      : {}),
    ...(payload.role ? { role: payload.role } : {}),
    ...(ro && ro.length <= 200 ? { o: ro } : {}),
  };
  return Buffer.from(JSON.stringify(body), 'utf8').toString('base64url');
}

export function decodeGoogleOAuthState(raw: string): GoogleOAuthStatePayload {
  if (!raw?.trim()) {
    return { from: '/' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(
      Buffer.from(raw, 'base64url').toString('utf8'),
    ) as EncodedState;
  } catch {
    throw new BadRequestException('Estado OAuth inválido');
  }
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    (parsed as EncodedState).v !== STATE_VERSION
  ) {
    throw new BadRequestException('Estado OAuth inválido');
  }
  const o = parsed as EncodedState;
  const from =
    typeof o.from === 'string' &&
    o.from.startsWith('/') &&
    !o.from.startsWith('//')
      ? o.from.slice(0, 512)
      : '/';
  const referral =
    typeof o.referral === 'string'
      ? o.referral.trim().toUpperCase()
      : undefined;
  const role =
    o.role === 'client' || o.role === 'freelancer' ? o.role : undefined;
  const returnOrigin =
    typeof o.o === 'string' && o.o.trim().length > 0 && o.o.length <= 200
      ? o.o.trim()
      : undefined;
  return {
    from,
    ...(referral ? { referral } : {}),
    ...(role ? { role } : {}),
    ...(returnOrigin ? { returnOrigin } : {}),
  };
}
