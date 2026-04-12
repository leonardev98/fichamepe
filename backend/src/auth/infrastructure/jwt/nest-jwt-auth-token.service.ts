import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type {
  AuthTokens,
  IAuthTokenService,
  JwtPayload,
} from '../../domain/services/auth-token.service.interface';
import { parseEnvDurationToSeconds } from '../utils/parse-env-duration';
import { requireEnvSecret } from '../utils/require-env-secret';

@Injectable()
export class NestJwtAuthTokenService implements IAuthTokenService {
  private readonly accessExpiresSec: number;
  private readonly refreshExpiresSec: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessExpiresSec = parseEnvDurationToSeconds(
      this.configService.get<string>('JWT_EXPIRES_IN'),
      15 * 60,
    );
    this.refreshExpiresSec = parseEnvDurationToSeconds(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      7 * 24 * 60 * 60,
    );
  }

  issueTokens(payload: JwtPayload): AuthTokens {
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: requireEnvSecret(this.configService, 'JWT_SECRET'),
        expiresIn: this.accessExpiresSec,
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: requireEnvSecret(this.configService, 'JWT_REFRESH_SECRET'),
        expiresIn: this.refreshExpiresSec,
      }),
    };
  }

  verifyRefreshToken(refreshToken: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(refreshToken, {
      secret: requireEnvSecret(this.configService, 'JWT_REFRESH_SECRET'),
    });
  }
}
