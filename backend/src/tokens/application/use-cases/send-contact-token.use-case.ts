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
export class SendContactTokenUseCase {
  constructor(
    @Inject(REPOSITORY_TOKEN)
    private readonly tokens: ITokenRepository,
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(params: {
    fromUserId: string;
    toUserId: string;
  }): Promise<void> {
    if (params.fromUserId === params.toUserId) {
      throw new BadRequestException('No puedes enviarte contacto a ti mismo');
    }
    const [from, to] = await Promise.all([
      this.users.findById(params.fromUserId),
      this.users.findById(params.toUserId),
    ]);
    if (!from || !to) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const balance = await this.tokens.getBalance(params.fromUserId);
    if (balance < 1) {
      throw new BadRequestException('Saldo insuficiente');
    }
    try {
      await this.tokens.sendContactPair({
        fromUserId: params.fromUserId,
        toUserId: params.toUserId,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'INSUFFICIENT_BALANCE') {
        throw new BadRequestException('Saldo insuficiente');
      }
      if (msg === 'USER_NOT_FOUND') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw e;
    }
  }
}
