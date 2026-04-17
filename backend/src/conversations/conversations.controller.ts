import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import type { RequestUser } from '../auth/domain/services/auth-token.service.interface';
import { CreateConversationDto } from './application/dto/create-conversation.dto';
import { SendMessageDto } from './application/dto/send-message.dto';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.conversations.listThreads(user.userId);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateConversationDto) {
    return this.conversations.createOrGetThreadUnified(user.userId, dto);
  }

  @Get(':conversationId/messages')
  getMessages(
    @CurrentUser() user: RequestUser,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.conversations.getMessageHistory(user.userId, conversationId);
  }

  @Post(':conversationId/messages')
  send(
    @CurrentUser() user: RequestUser,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.conversations.sendMessage(
      user.userId,
      conversationId,
      dto.text,
    );
  }
}
