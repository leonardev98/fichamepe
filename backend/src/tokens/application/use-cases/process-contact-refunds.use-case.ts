import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ITokenRepository } from '../../domain/repositories/i-token.repository';
import { REPOSITORY_TOKEN } from '../../tokens.di-tokens';

const HOURS_48_MS = 48 * 60 * 60 * 1000;

@Injectable()
export class ProcessContactRefundsUseCase {
  private readonly logger = new Logger(ProcessContactRefundsUseCase.name);

  constructor(
    @Inject(REPOSITORY_TOKEN)
    private readonly tokens: ITokenRepository,
  ) {}

  async execute(): Promise<number> {
    const cutoff = new Date(Date.now() - HOURS_48_MS);
    const candidates =
      await this.tokens.findRefundEligibleContactReceived(cutoff);
    let applied = 0;
    for (const received of candidates) {
      const pairId = received.metadata?.pairId;
      if (typeof pairId !== 'string') {
        continue;
      }
      const sent = await this.tokens.findCompletedContactSentByPairId(pairId);
      if (!sent?.fromUserId) {
        continue;
      }
      if (await this.tokens.hasCompletedRefundForPair(pairId)) {
        continue;
      }
      try {
        await this.tokens.applyContactRefund({
          pairId,
          senderUserId: sent.fromUserId,
          contactReceivedId: received.id,
        });
        applied += 1;
      } catch (e) {
        this.logger.warn(`Reembolso omitido (${received.id}): ${String(e)}`);
      }
    }
    return applied;
  }
}
