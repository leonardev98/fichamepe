import type { Request } from 'express';
import { FP_REFRESH_COOKIE } from '../constants/auth-cookies.constants';

export function extractRefreshTokenFromRequest(req: Request): string | null {
  const bodyToken = req.body?.refreshToken;
  if (typeof bodyToken === 'string' && bodyToken.length > 0) {
    return bodyToken;
  }
  const cookieToken = req.cookies?.[FP_REFRESH_COOKIE];
  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }
  const auth = req.headers?.authorization;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    const t = auth.slice(7).trim();
    return t || null;
  }
  const headerToken = req.headers?.['x-refresh-token'];
  if (typeof headerToken === 'string' && headerToken.length > 0) {
    return headerToken;
  }
  return null;
}
