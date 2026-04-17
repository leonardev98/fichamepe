import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ServicesModule } from '../services/services.module';
import { ConversationOrmEntity } from '../conversations/infrastructure/persistence/entities/conversation.orm-entity';
import { ProfileOrmEntity } from '../profiles/infrastructure/persistence/entities/profile.orm-entity';
import { ServiceOrmEntity } from '../services/infrastructure/persistence/entities/service.orm';
import { CreateServiceReviewUseCase } from './application/use-cases/create-service-review.use-case';
import { GetMyServiceReviewUseCase } from './application/use-cases/get-my-service-review.use-case';
import { ListServiceReviewsUseCase } from './application/use-cases/list-service-reviews.use-case';
import { ServiceReviewsController } from './infrastructure/controllers/service-reviews.controller';
import { ServiceReviewOrmEntity } from './infrastructure/persistence/entities/service-review.orm-entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceReviewOrmEntity,
      ConversationOrmEntity,
      ServiceOrmEntity,
      ProfileOrmEntity,
    ]),
    ServicesModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [ServiceReviewsController],
  providers: [
    ListServiceReviewsUseCase,
    CreateServiceReviewUseCase,
    GetMyServiceReviewUseCase,
  ],
})
export class ServiceReviewsModule {}
