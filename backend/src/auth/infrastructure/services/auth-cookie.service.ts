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

  setAuthCookies(res: Response, refreshToken: string, role: UserRole): void {
    const secure = process.env.NODE_ENV === 'production';
    res.cookie(FP_REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: this.refreshMaxAgeMs,
    });
    res.cookie(FP_ROLE_COOKIE, role, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: this.refreshMaxAgeMs,
    });
  }

  clearAuthCookies(res: Response): void {
    const secure = process.env.NODE_ENV === 'production';
    res.clearCookie(FP_REFRESH_COOKIE, { path: '/', secure, sameSite: 'lax' });
    res.clearCookie(FP_ROLE_COOKIE, { path: '/', secure, sameSite: 'lax' });
  }
}
