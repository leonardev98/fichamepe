import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ActivateSubscriptionUseCase } from './application/use-cases/activate-subscription.use-case';
import { CreatePendingSubscriptionUseCase } from './application/use-cases/create-pending-subscription.use-case';
import { ExpireSubscriptionUseCase } from './application/use-cases/expire-subscription.use-case';
import { GetMySubscriptionUseCase } from './application/use-cases/get-my-subscription.use-case';
import { SubscriptionsController } from './infrastructure/controllers/subscriptions.controller';
import { SubscriptionOrmEntity } from './infrastructure/persistence/entities/subscription.orm';
import { SubscriptionTypeOrmRepository } from './infrastructure/persistence/repositories/subscription.typeorm.repository';
import { SubscriptionsExpireCron } from './infrastructure/subscriptions-expire.cron';
import { REPOSITORY_TOKEN } from './subscriptions.di-tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionOrmEntity]),
    UsersModule,
    AuthModule,
  ],
  controllers: [SubscriptionsController],
  providers: [
    { provide: REPOSITORY_TOKEN, useClass: SubscriptionTypeOrmRepository },
    CreatePendingSubscriptionUseCase,
    GetMySubscriptionUseCase,
    ActivateSubscriptionUseCase,
    ExpireSubscriptionUseCase,
    SubscriptionsExpireCron,
  ],
  exports: [
    REPOSITORY_TOKEN,
    TypeOrmModule.forFeature([SubscriptionOrmEntity]),
  ],
})
export class SubscriptionsModule {}
