import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExpireSubscriptionUseCase } from '../application/use-cases/expire-subscription.use-case';

@Injectable()
export class SubscriptionsExpireCron {
  constructor(
    private readonly expireSubscriptions: ExpireSubscriptionUseCase,
  ) {}

  @Cron('5 * * * *')
  handleHourly(): Promise<number> {
    return this.expireSubscriptions.execute();
  }
}
