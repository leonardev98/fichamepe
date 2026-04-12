import { Inject, Injectable } from '@nestjs/common';
import type { Skill } from '../../domain/entities/skill.domain';
import type { ISkillRepository } from '../../domain/repositories/i-skill.repository';
import { REPOSITORY_TOKEN } from '../../skills.di-tokens';

@Injectable()
export class GetSkillsByCategoryUseCase {
  constructor(
    @Inject(REPOSITORY_TOKEN)
    private readonly skills: ISkillRepository,
  ) {}

  async execute(category: string): Promise<Skill[]> {
    return this.skills.findByCategory(category);
  }
}
