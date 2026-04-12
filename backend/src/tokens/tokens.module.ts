import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { UserOrmEntity } from '../users/infrastructure/persistence/entities/user.orm-entity';
import { GetTokenBalanceUseCase } from './application/use-cases/get-token-balance.use-case';
import { GetTransactionHistoryUseCase } from './application/use-cases/get-transaction-history.use-case';
import { GrantTokensManuallyUseCase } from './application/use-cases/grant-tokens-manually.use-case';
import { MarkContactRespondedUseCase } from './application/use-cases/mark-contact-responded.use-case';
import { ProcessContactRefundsUseCase } from './application/use-cases/process-contact-refunds.use-case';
import { SendContactTokenUseCase } from './application/use-cases/send-contact-token.use-case';
import { TokensController } from './infrastructure/controllers/tokens.controller';
import { TokenTransactionOrmEntity } from './infrastructure/persistence/entities/token-transaction.orm';
import { TokenTransactionTypeOrmRepository } from './infrastructure/persistence/repositories/token-transaction.typeorm.repository';
import { TokensRefundCron } from './infrastructure/tokens-refund.cron';
import { REPOSITORY_TOKEN } from './tokens.di-tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenTransactionOrmEntity, UserOrmEntity]),
    UsersModule,
    AuthModule,
  ],
  controllers: [TokensController],
  providers: [
    { provide: REPOSITORY_TOKEN, useClass: TokenTransactionTypeOrmRepository },
    GetTokenBalanceUseCase,
    GetTransactionHistoryUseCase,
    SendContactTokenUseCase,
    GrantTokensManuallyUseCase,
    MarkContactRespondedUseCase,
    ProcessContactRefundsUseCase,
    TokensRefundCron,
  ],
  exports: [
    REPOSITORY_TOKEN,
    TypeOrmModule.forFeature([TokenTransactionOrmEntity]),
    MarkContactRespondedUseCase,
  ],
})
export class TokensModule {}
