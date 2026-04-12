import { Inject, Injectable } from '@nestjs/common';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../domain/entities/subscription.domain';
import type { ISubscriptionRepository } from '../../domain/repositories/i-subscription.repository';
import { REPOSITORY_TOKEN } from '../../subscriptions.di-tokens';

@Injectable()
export class CreatePendingSubscriptionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKEN)
    private readonly subscriptions: ISubscriptionRepository,
  ) {}

  execute(params: {
    userId: string;
    plan: SubscriptionPlan;
    amount?: string;
    paymentMethod?: string | null;
    paymentReference?: string | null;
  }) {
    const amount = params.amount ?? '0.00';
    return this.subscriptions.create({
      userId: params.userId,
      plan: params.plan,
      status: SubscriptionStatus.PendingPayment,
      amount,
      paymentMethod: params.paymentMethod ?? null,
      paymentReference: params.paymentReference ?? null,
    });
  }
}
