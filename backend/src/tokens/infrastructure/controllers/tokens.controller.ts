import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import type { RequestUser } from '../../../auth/domain/services/auth-token.service.interface';
import { UserRole } from '../../../users/domain/entities/user';
import { GrantTokensBodyDto } from '../../application/dto/grant-tokens-body.dto';
import { SendContactTokenBodyDto } from '../../application/dto/send-contact-token.dto';
import { TokenHistoryQueryDto } from '../../application/dto/token-history-query.dto';
import { GetTokenBalanceUseCase } from '../../application/use-cases/get-token-balance.use-case';
import { GetTransactionHistoryUseCase } from '../../application/use-cases/get-transaction-history.use-case';
import { GrantTokensManuallyUseCase } from '../../application/use-cases/grant-tokens-manually.use-case';
import { SendContactTokenUseCase } from '../../application/use-cases/send-contact-token.use-case';

@Controller('tokens')
@UseGuards(JwtAuthGuard)
export class TokensController {
  constructor(
    private readonly getBalance: GetTokenBalanceUseCase,
    private readonly sendContact: SendContactTokenUseCase,
    private readonly getHistory: GetTransactionHistoryUseCase,
    private readonly grantManual: GrantTokensManuallyUseCase,
  ) {}

  @Get('balance')
  balance(@CurrentUser() user: RequestUser) {
    return this.getBalance.execute(user.userId);
  }

  @Post('contact')
  contact(
    @CurrentUser() user: RequestUser,
    @Body() body: SendContactTokenBodyDto,
  ) {
    return this.sendContact.execute({
      fromUserId: user.userId,
      toUserId: body.targetUserId,
    });
  }

  @Get('history')
  history(
    @CurrentUser() user: RequestUser,
    @Query() query: TokenHistoryQueryDto,
  ) {
    return this.getHistory.execute(user.userId, query.page, query.limit);
  }

  @Post('grant')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  grant(@CurrentUser() admin: RequestUser, @Body() body: GrantTokensBodyDto) {
    return this.grantManual.execute({
      targetUserId: body.userId,
      amount: body.amount,
      adminUserId: admin.userId,
    });
  }
}
