import { Inject, Injectable } from '@nestjs/common';
import type { ITokenRepository } from '../../domain/repositories/i-token.repository';
import { REPOSITORY_TOKEN } from '../../tokens.di-tokens';

@Injectable()
export class GetTransactionHistoryUseCase {
  constructor(
    @Inject(REPOSITORY_TOKEN)
    private readonly tokens: ITokenRepository,
  ) {}

  execute(userId: string, page: number, limit: number) {
    return this.tokens.findByUserId(userId, page, limit);
  }
}
