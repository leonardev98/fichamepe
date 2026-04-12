import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetAllSkillsUseCase } from './application/use-cases/get-all-skills.use-case';
import { GetSkillsByCategoryUseCase } from './application/use-cases/get-skills-by-category.use-case';
import { SeedSkillsUseCase } from './application/use-cases/seed-skills.use-case';
import { SkillsController } from './infrastructure/controllers/skills.controller';
import { SkillOrmEntity } from './infrastructure/persistence/entities/skill.orm';
import { SkillTypeOrmRepository } from './infrastructure/persistence/repositories/skill.typeorm.repository';
import { SkillsSeedRunner } from './infrastructure/skills-seed.runner';
import { REPOSITORY_TOKEN } from './skills.di-tokens';

@Module({
  imports: [TypeOrmModule.forFeature([SkillOrmEntity])],
  controllers: [SkillsController],
  providers: [
    { provide: REPOSITORY_TOKEN, useClass: SkillTypeOrmRepository },
    GetAllSkillsUseCase,
    GetSkillsByCategoryUseCase,
    SeedSkillsUseCase,
    SkillsSeedRunner,
  ],
  exports: [REPOSITORY_TOKEN, TypeOrmModule.forFeature([SkillOrmEntity])],
})
export class SkillsModule {}
