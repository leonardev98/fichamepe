import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../../../users/domain/entities/user';
import type {
  JwtPayload,
  RequestUser,
} from '../../domain/services/auth-token.service.interface';
import { requireEnvSecret } from '../utils/require-env-secret';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireEnvSecret(configService, 'JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): RequestUser {
    if (!payload?.userId || !payload?.email || !payload?.role) {
      throw new UnauthorizedException('Token inválido');
    }
    if (!Object.values(UserRole).includes(payload.role)) {
      throw new UnauthorizedException('Token inválido');
    }
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  }
}
