import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { SkillsModule } from './skills/skills.module';
import { TokensModule } from './tokens/tokens.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UploadsModule } from './uploads/uploads.module';
import { AdminModule } from './admin/admin.module';
import { ServicesModule } from './services/services.module';
import { ModerationReportsModule } from './moderation-reports/moderation-reports.module';
import { ServiceReviewsModule } from './service-reviews/service-reviews.module';
import { PresenceModule } from './presence/presence.module';
import { ConversationsModule } from './conversations/conversations.module';
import { PublicationSlotPurchasesModule } from './publication-slot-purchases/publication-slot-purchases.module';
import { ClientRequestsModule } from './client-requests/client-requests.module';
import { NotificationsModule } from './notifications/notifications.module';
import { buildTypeOrmOptions } from './database/typeorm-options.factory';
import { validateEnv } from './common/config/env.validation';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60 * 1000,
        limit: 10,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildTypeOrmOptions(configService),
    }),
    UsersModule,
    AuthModule,
    ProfilesModule,
    SkillsModule,
    TokensModule,
    SubscriptionsModule,
    UploadsModule,
    AdminModule,
    ServiceReviewsModule,
    ServicesModule,
    ModerationReportsModule,
    PresenceModule,
    ConversationsModule,
    PublicationSlotPurchasesModule,
    ClientRequestsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
