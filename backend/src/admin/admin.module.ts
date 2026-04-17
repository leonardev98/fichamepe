import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ServicesModule } from '../services/services.module';
import { UsersModule } from '../users/users.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { PresenceModule } from '../presence/presence.module';
import { ListReviewQueueUseCase } from './application/use-cases/list-review-queue.use-case';
import { ApproveServicePublicationUseCase } from './application/use-cases/approve-service-publication.use-case';
import { RequestServiceChangesUseCase } from './application/use-cases/request-service-changes.use-case';
import { AdminStatsController } from './infrastructure/controllers/admin-stats.controller';
import { AdminStatsService } from './infrastructure/services/admin-stats.service';
import { AdminUsersController } from './infrastructure/controllers/admin-users.controller';
import { AdminUsersService } from './infrastructure/services/admin-users.service';
import { UserOrmEntity } from '../users/infrastructure/persistence/entities/user.orm-entity';
import { ServiceOrmEntity } from '../services/infrastructure/persistence/entities/service.orm';
import { ProfileOrmEntity } from '../profiles/infrastructure/persistence/entities/profile.orm-entity';
import { AuthLoginEventOrmEntity } from '../auth/infrastructure/persistence/entities/auth-login-event.orm';
import { UserPresenceOrmEntity } from '../presence/infrastructure/persistence/entities/user-presence.orm';
import { ClientRequestOrmEntity } from '../client-requests/infrastructure/persistence/entities/client-request.orm';
import { ApproveClientRequestUseCase } from './application/use-cases/approve-client-request.use-case';
import { ListClientRequestReviewQueueUseCase } from './application/use-cases/list-client-request-review-queue.use-case';
import { RequestClientRequestChangesUseCase } from './application/use-cases/request-client-request-changes.use-case';
import { ModerationReportsModule } from '../moderation-reports/moderation-reports.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    NotificationsModule,
    ServicesModule,
    UsersModule,
    ProfilesModule,
    PresenceModule,
    ModerationReportsModule,
    TypeOrmModule.forFeature([
      UserOrmEntity,
      ServiceOrmEntity,
      ProfileOrmEntity,
      AuthLoginEventOrmEntity,
      UserPresenceOrmEntity,
      ClientRequestOrmEntity,
    ]),
  ],
  controllers: [
    AdminController,
    AdminStatsController,
    AdminUsersController,
  ],
  providers: [
    AdminService,
    ListReviewQueueUseCase,
    ApproveServicePublicationUseCase,
    RequestServiceChangesUseCase,
    ListClientRequestReviewQueueUseCase,
    ApproveClientRequestUseCase,
    RequestClientRequestChangesUseCase,
    AdminStatsService,
    AdminUsersService,
  ],
})
export class AdminModule {}
