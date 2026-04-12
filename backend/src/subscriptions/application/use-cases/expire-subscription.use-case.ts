import { Inject, Injectable, Logger } from '@nestjs/common';
import { SubscriptionStatus } from '../../domain/entities/subscription.domain';
import type { ISubscriptionRepository } from '../../domain/repositories/i-subscription.repository';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import { REPOSITORY_TOKEN } from '../../subscriptions.di-tokens';

@Injectable()
export class ExpireSubscriptionUseCase {
  private readonly logger = new Logger(ExpireSubscriptionUseCase.name);

  constructor(
    @Inject(REPOSITORY_TOKEN)
    private readonly subscriptions: ISubscriptionRepository,
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(referenceDate = new Date()): Promise<number> {
    const due = await this.subscriptions.findActiveExpiredBefore(referenceDate);
    let n = 0;
    for (const sub of due) {
      await this.subscriptions.update(sub.id, {
        status: SubscriptionStatus.Expired,
      });
      await this.users.update(sub.userId, {
        isPro: false,
        proExpiresAt: null,
      });
      n += 1;
    }
    if (n > 0) {
      this.logger.log(`Suscripciones expiradas: ${n}`);
    }
    return n;
  }
}
