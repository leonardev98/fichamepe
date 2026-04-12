import { Inject, Injectable } from '@nestjs/common';
import type { ITokenRepository } from '../../domain/repositories/i-token.repository';
import { REPOSITORY_TOKEN } from '../../tokens.di-tokens';

@Injectable()
export class MarkContactRespondedUseCase {
  constructor(
    @Inject(REPOSITORY_TOKEN)
    private readonly tokens: ITokenRepository,
  ) {}

  execute(params: {
    transactionId: string;
    actingUserId: string;
    respondedAt?: Date;
  }): Promise<boolean> {
    return this.tokens.setRespondedAtIfRecipient({
      transactionId: params.transactionId,
      actingUserId: params.actingUserId,
      respondedAt: params.respondedAt ?? new Date(),
    });
  }
}
