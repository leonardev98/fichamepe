import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import type {
  AuthTokens,
  IAuthTokenService,
  JwtPayload,
} from '../../domain/services/auth-token.service.interface';
import { AUTH_TOKEN_SERVICE } from '../../auth.di-tokens';

@Injectable()
export class RefreshTokensUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly tokens: IAuthTokenService,
  ) {}

  async execute(userId: string, refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = this.tokens.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    if (payload.userId !== userId) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    const user = await this.users.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }
    if (user.email !== payload.email || user.role !== payload.role) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    return this.tokens.issueTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
