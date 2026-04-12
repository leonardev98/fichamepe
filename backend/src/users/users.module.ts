import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { UsersController } from './infrastructure/controllers/users.controller';
import { UserOrmEntity } from './infrastructure/persistence/entities/user.orm-entity';
import { UserTypeOrmRepository } from './infrastructure/persistence/repositories/user.typeorm.repository';
import { USER_REPOSITORY } from './users.di-tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
    GetUserByIdUseCase,
    UpdateUserUseCase,
  ],
  exports: [
    USER_REPOSITORY,
    TypeOrmModule.forFeature([UserOrmEntity]),
    GetUserByIdUseCase,
  ],
})
export class UsersModule {}
