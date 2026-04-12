import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import type { RequestUser } from '../../../auth/domain/services/auth-token.service.interface';
import { UserRole } from '../../../users/domain/entities/user';
import { CreatePendingSubscriptionBodyDto } from '../../application/dto/create-pending-subscription.dto';
import { ActivateSubscriptionUseCase } from '../../application/use-cases/activate-subscription.use-case';
import { CreatePendingSubscriptionUseCase } from '../../application/use-cases/create-pending-subscription.use-case';
import { GetMySubscriptionUseCase } from '../../application/use-cases/get-my-subscription.use-case';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly createPending: CreatePendingSubscriptionUseCase,
    private readonly getMy: GetMySubscriptionUseCase,
    private readonly activateSubscription: ActivateSubscriptionUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreatePendingSubscriptionBodyDto,
  ) {
    return this.createPending.execute({
      userId: user.userId,
      plan: body.plan,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      paymentReference: body.paymentReference,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestUser) {
    return this.getMy.execute(user.userId);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  activate(
    @CurrentUser() admin: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.activateSubscription.execute({
      subscriptionId: id,
      adminUserId: admin.userId,
    });
  }
}
