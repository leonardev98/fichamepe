import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ClientRequestCommentOrmEntity } from '../client-requests/infrastructure/persistence/entities/client-request-comment.orm';
import { ClientRequestOrmEntity } from '../client-requests/infrastructure/persistence/entities/client-request.orm';
import { ServicesModule } from '../services/services.module';
import { ServiceOrmEntity } from '../services/infrastructure/persistence/entities/service.orm';
import { ProfileOrmEntity } from '../profiles/infrastructure/persistence/entities/profile.orm-entity';
import { UserOrmEntity } from '../users/infrastructure/persistence/entities/user.orm-entity';
import { CreateModerationReportUseCase } from './application/use-cases/create-moderation-report.use-case';
import { ListModerationReportsAdminUseCase } from './application/use-cases/list-moderation-reports-admin.use-case';
import { DismissModerationReportUseCase } from './application/use-cases/dismiss-moderation-report.use-case';
import { ApplyModerationReportUseCase } from './application/use-cases/apply-moderation-report.use-case';
import { ModerationReportsController } from './infrastructure/controllers/moderation-reports.controller';
import { ModerationReportOrmEntity } from './infrastructure/persistence/entities/moderation-report.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ModerationReportOrmEntity,
      ServiceOrmEntity,
      ClientRequestOrmEntity,
      ClientRequestCommentOrmEntity,
      UserOrmEntity,
      ProfileOrmEntity,
    ]),
    AuthModule,
    ServicesModule,
  ],
  controllers: [ModerationReportsController],
  providers: [
    CreateModerationReportUseCase,
    ListModerationReportsAdminUseCase,
    DismissModerationReportUseCase,
    ApplyModerationReportUseCase,
  ],
  exports: [
    CreateModerationReportUseCase,
    ListModerationReportsAdminUseCase,
    DismissModerationReportUseCase,
    ApplyModerationReportUseCase,
  ],
})
export class ModerationReportsModule {}
