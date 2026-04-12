import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { UserRole } from '../../../users/domain/entities/user';
import type {
  JwtPayload,
  RequestUser,
} from '../../domain/services/auth-token.service.interface';
import { extractRefreshTokenFromRequest } from '../utils/refresh-token.extractor';
import { requireEnvSecret } from '../utils/require-env-secret';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => extractRefreshTokenFromRequest(req),
      ]),
      ignoreExpiration: false,
      secretOrKey: requireEnvSecret(configService, 'JWT_REFRESH_SECRET'),
      passReqToCallback: false,
    });
  }

  validate(payload: JwtPayload): RequestUser {
    if (!payload?.userId || !payload?.email || !payload?.role) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    if (!Object.values(UserRole).includes(payload.role)) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  }
}
