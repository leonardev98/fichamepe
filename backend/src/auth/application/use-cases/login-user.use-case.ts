import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { IUserRepository } from '../../../users/domain/repositories';
import type { UserRole } from '../../../users/domain/entities/user';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import type {
  AuthTokens,
  IAuthTokenService,
} from '../../domain/services/auth-token.service.interface';
import { AUTH_TOKEN_SERVICE } from '../../auth.di-tokens';
import type { LoginDto } from '../dto/login.dto';

export type LoginResult = AuthTokens & { role: UserRole; userId: string };

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly tokens: IAuthTokenService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const user = await this.users.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada');
    }
    if (!user.password) {
      throw new UnauthorizedException(
        'Esta cuenta usa Google. Inicia sesión con Google.',
      );
    }
    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const tokens = this.tokens.issueTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return { ...tokens, role: user.role, userId: user.id };
  }
}
