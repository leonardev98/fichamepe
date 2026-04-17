import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import type { RequestUser } from '../auth/domain/services/auth-token.service.interface';
import { ListNotificationsQueryDto } from './application/dto/list-notifications-query.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('unread-count')
  unreadCount(@CurrentUser() user: RequestUser) {
    return this.notifications
      .getUnreadCount(user.userId)
      .then((unreadCount) => ({
        unreadCount,
      }));
  }

  @Get()
  list(
    @CurrentUser() user: RequestUser,
    @Query() query: ListNotificationsQueryDto,
  ) {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    return this.notifications.listForUser(user.userId, limit, offset);
  }

  @Patch(':id/read')
  markRead(
    @CurrentUser() user: RequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.notifications.markRead(user.userId, id);
  }

  @Post('read-all')
  readAll(@CurrentUser() user: RequestUser) {
    return this.notifications.markAllRead(user.userId);
  }
}
