import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { SkillOrmEntity } from '../skills/infrastructure/persistence/entities/skill.orm';
import { UsersModule } from '../users/users.module';
import { CreateProfileUseCase } from './application/use-cases/create-profile.use-case';
import { GetProfileByUserIdUseCase } from './application/use-cases/get-profile-by-user-id.use-case';
import { SearchProfilesUseCase } from './application/use-cases/search-profiles.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { ProfilesController } from './infrastructure/controllers/profiles.controller';
import { ProfileOrmEntity } from './infrastructure/persistence/entities/profile.orm-entity';
import { ProfileTypeOrmRepository } from './infrastructure/persistence/repositories/profile.typeorm.repository';
import { PROFILE_REPOSITORY } from './profiles.di-tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileOrmEntity, SkillOrmEntity]),
    UsersModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [ProfilesController],
  providers: [
    { provide: PROFILE_REPOSITORY, useClass: ProfileTypeOrmRepository },
    CreateProfileUseCase,
    UpdateProfileUseCase,
    GetProfileByUserIdUseCase,
    SearchProfilesUseCase,
  ],
  exports: [PROFILE_REPOSITORY],
})
export class ProfilesModule {}
