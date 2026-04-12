import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { IUserRepository } from '../../../users/domain/repositories';
import type { SafeUser } from '../../../users/domain/entities';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import type {
  AuthTokens,
  IAuthTokenService,
} from '../../domain/services/auth-token.service.interface';
import { AUTH_TOKEN_SERVICE } from '../../auth.di-tokens';
import type { RegisterDto } from '../dto/register.dto';

export interface RegisterUserResult extends AuthTokens {
  user: SafeUser;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly tokens: IAuthTokenService,
  ) {}

  async execute(dto: RegisterDto): Promise<RegisterUserResult> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName?.trim() ? dto.fullName.trim() : null,
      role: dto.role,
    });
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = this.tokens.issueTokens(tokenPayload);
    const { password: _p, ...safe } = user;
    return { ...tokens, user: safe };
  }
}
