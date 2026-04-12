import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionStatus } from '../../domain/entities/subscription.domain';
import type { ISubscriptionRepository } from '../../domain/repositories/i-subscription.repository';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import { REPOSITORY_TOKEN } from '../../subscriptions.di-tokens';

const ACTIVE_DAYS = 30;

@Injectable()
export class ActivateSubscriptionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKEN)
    private readonly subscriptions: ISubscriptionRepository,
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(params: { subscriptionId: string; adminUserId: string }) {
    const sub = await this.subscriptions.findById(params.subscriptionId);
    if (!sub) {
      throw new NotFoundException('Suscripción no encontrada');
    }
    if (sub.status !== SubscriptionStatus.PendingPayment) {
      throw new BadRequestException(
        'Solo se pueden activar suscripciones en pending_payment',
      );
    }
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + ACTIVE_DAYS);
    const updated = await this.subscriptions.update(sub.id, {
      status: SubscriptionStatus.Active,
      activatedAt: now,
      expiresAt,
      activatedBy: params.adminUserId,
    });
    await this.users.update(sub.userId, {
      isPro: true,
      proExpiresAt: expiresAt,
    });
    return updated;
  }
}
