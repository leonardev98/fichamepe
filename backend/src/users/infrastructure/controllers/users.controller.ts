import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import type { RequestUser } from '../../../auth/domain/services/auth-token.service.interface';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { ApplyReferralUseCase } from '../../application/use-cases/apply-referral.use-case';
import { ListMyReferredUsersUseCase } from '../../application/use-cases/list-my-referred-users.use-case';
import { UpdateUserBodyDto } from '../../application/dto/update-user.dto';
import { ApplyReferralBodyDto } from '../../application/dto/apply-referral.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly getUserById: GetUserByIdUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly applyReferral: ApplyReferralUseCase,
    private readonly listMyReferredUsers: ListMyReferredUsersUseCase,
  ) {}

  @Get('me/referrals')
  listMyReferrals(@CurrentUser() user: RequestUser) {
    return this.listMyReferredUsers.execute(user.userId);
  }

  @Post('me/referral')
  applyReferralCode(
    @CurrentUser() user: RequestUser,
    @Body() body: ApplyReferralBodyDto,
  ) {
    return this.applyReferral.execute(user.userId, body.code);
  }

  @Get(':id')
  getOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    if (id !== user.userId) {
      throw new ForbiddenException();
    }
    return this.getUserById.execute(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: UpdateUserBodyDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.updateUser.execute({
      targetUserId: id,
      actorUserId: user.userId,
      patch: body,
    });
  }
}
