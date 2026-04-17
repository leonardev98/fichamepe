import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProfileOrmEntity } from '../profiles/infrastructure/persistence/entities/profile.orm-entity';
import { UserOrmEntity } from '../users/infrastructure/persistence/entities/user.orm-entity';
import { UsersModule } from '../users/users.module';
import { AddClientRequestCommentUseCase } from './application/use-cases/add-client-request-comment.use-case';
import { ApplyToClientRequestUseCase } from './application/use-cases/apply-to-client-request.use-case';
import { CreateClientRequestUseCase } from './application/use-cases/create-client-request.use-case';
import { GetPublicClientRequestUseCase } from './application/use-cases/get-public-client-request.use-case';
import { ListClientRequestCommentsUseCase } from './application/use-cases/list-client-request-comments.use-case';
import { ListMyClientRequestsUseCase } from './application/use-cases/list-my-client-requests.use-case';
import { ListOpenClientRequestsUseCase } from './application/use-cases/list-open-client-requests.use-case';
import { ResubmitClientRequestUseCase } from './application/use-cases/resubmit-client-request.use-case';
import { UpdateClientRequestUseCase } from './application/use-cases/update-client-request.use-case';
import { ClientRequestsController } from './infrastructure/controllers/client-requests.controller';
import { ClientRequestApplicationOrmEntity } from './infrastructure/persistence/entities/client-request-application.orm';
import { ClientRequestCommentOrmEntity } from './infrastructure/persistence/entities/client-request-comment.orm';
import { ClientRequestOrmEntity } from './infrastructure/persistence/entities/client-request.orm';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClientRequestOrmEntity,
      ClientRequestApplicationOrmEntity,
      ClientRequestCommentOrmEntity,
      UserOrmEntity,
      ProfileOrmEntity,
    ]),
    AuthModule,
    NotificationsModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [ClientRequestsController],
  providers: [
    ListOpenClientRequestsUseCase,
    ListMyClientRequestsUseCase,
    GetPublicClientRequestUseCase,
    ListClientRequestCommentsUseCase,
    AddClientRequestCommentUseCase,
    CreateClientRequestUseCase,
    UpdateClientRequestUseCase,
    ResubmitClientRequestUseCase,
    ApplyToClientRequestUseCase,
  ],
  exports: [
    TypeOrmModule.forFeature([
      ClientRequestOrmEntity,
      ClientRequestApplicationOrmEntity,
      ClientRequestCommentOrmEntity,
    ]),
  ],
})
export class ClientRequestsModule {}
