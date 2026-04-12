import { Inject, Injectable } from '@nestjs/common';
import type { ITokenRepository } from '../../domain/repositories/i-token.repository';
import { REPOSITORY_TOKEN } from '../../tokens.di-tokens';

@Injectable()
export class GetTokenBalanceUseCase {
  constructor(
    @Inject(REPOSITORY_TOKEN)
    private readonly tokens: ITokenRepository,
  ) {}

  async execute(userId: string): Promise<{ balance: number }> {
    const balance = await this.tokens.getBalance(userId);
    return { balance };
  }
}
