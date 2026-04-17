import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ProfileOrmEntity } from '../profiles/infrastructure/persistence/entities/profile.orm-entity';
import { ClientRequestOrmEntity } from '../client-requests/infrastructure/persistence/entities/client-request.orm';
import { ServiceOrmEntity } from '../services/infrastructure/persistence/entities/service.orm';
import { UserOrmEntity } from '../users/infrastructure/persistence/entities/user.orm-entity';
import { ChatGateway } from './chat.gateway';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationMessageOrmEntity } from './infrastructure/persistence/entities/conversation-message.orm-entity';
import { ConversationOrmEntity } from './infrastructure/persistence/entities/conversation.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationOrmEntity,
      ConversationMessageOrmEntity,
      ClientRequestOrmEntity,
      ServiceOrmEntity,
      ProfileOrmEntity,
      UserOrmEntity,
    ]),
    UsersModule,
    AuthModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ChatGateway],
  exports: [ConversationsService, ChatGateway],
})
export class ConversationsModule {}
