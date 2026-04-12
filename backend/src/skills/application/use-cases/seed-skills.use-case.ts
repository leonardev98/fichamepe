import { Inject, Injectable } from '@nestjs/common';
import type { ISkillRepository } from '../../domain/repositories/i-skill.repository';
import { flatPredefinedSkillSeeds } from '../constants/predefined-skills';
import { REPOSITORY_TOKEN } from '../../skills.di-tokens';

@Injectable()
export class SeedSkillsUseCase {
  constructor(
    @Inject(REPOSITORY_TOKEN)
    private readonly skills: ISkillRepository,
  ) {}

  async execute(): Promise<void> {
    await this.skills.seed(flatPredefinedSkillSeeds());
  }
}
