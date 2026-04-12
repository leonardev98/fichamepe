import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import type { ITokenRepository } from '../../domain/repositories/i-token.repository';
import { REPOSITORY_TOKEN } from '../../tokens.di-tokens';

@Injectable()
export class GrantTokensManuallyUseCase {
  constructor(
    @Inject(REPOSITORY_TOKEN)
    private readonly tokens: ITokenRepository,
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(params: {
    targetUserId: string;
    amount: number;
    adminUserId: string;
  }): Promise<void> {
    if (params.amount < 1) {
      throw new BadRequestException('amount debe ser >= 1');
    }
    const target = await this.users.findById(params.targetUserId);
    if (!target) {
      throw new NotFoundException('Usuario no encontrado');
    }
    try {
      await this.tokens.grantManualTokens({
        toUserId: params.targetUserId,
        amount: params.amount,
        createdByAdminId: params.adminUserId,
      });
    } catch (e) {
      if (e instanceof Error && e.message === 'USER_NOT_FOUND') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw e;
    }
  }
}
