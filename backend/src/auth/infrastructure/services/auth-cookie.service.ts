import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { UserRole } from '../../../users/domain/entities/user';
import {
  FP_REFRESH_COOKIE,
  FP_ROLE_COOKIE,
} from '../constants/auth-cookies.constants';
import { parseEnvDurationToSeconds } from '../utils/parse-env-duration';

@Injectable()
export class AuthCookieService {
  private readonly refreshMaxAgeMs: number;

  constructor(private readonly configService: ConfigService) {
    const sec = parseEnvDurationToSeconds(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      7 * 24 * 60 * 60,
    );
    this.refreshMaxAgeMs = sec * 1000;
  }

  /**
   * - Por defecto `lax`: bien si front y API comparten sitio (ej. fichame.pe + api.fichame.pe).
   * - `none` + Secure: necesario si el SPA y el API están en **dominios de tercer nivel distintos**
   *   (ej. *.vercel.app vs *.railway.app); sin esto el navegador no manda la cookie en fetch/XHR.
   */
  private cookieFlags(): { secure: boolean; sameSite: 'lax' | 'none' } {
    const raw = this.configService
      .get<string>('AUTH_COOKIE_SAMESITE')
      ?.trim()
      .toLowerCase();
    if (raw === 'none') {
      return { sameSite: 'none', secure: true };
    }
    return {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    };
  }

  setAuthCookies(res: Response, refreshToken: string, role: UserRole): void {
    const { secure, sameSite } = this.cookieFlags();
    res.cookie(FP_REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      maxAge: this.refreshMaxAgeMs,
    });
    res.cookie(FP_ROLE_COOKIE, role, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      maxAge: this.refreshMaxAgeMs,
    });
  }

  clearAuthCookies(res: Response): void {
    const { secure, sameSite } = this.cookieFlags();
    res.clearCookie(FP_REFRESH_COOKIE, { path: '/', secure, sameSite });
    res.clearCookie(FP_ROLE_COOKIE, { path: '/', secure, sameSite });
  }
}
