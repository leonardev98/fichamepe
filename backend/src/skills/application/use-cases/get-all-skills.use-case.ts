import { Inject, Injectable } from '@nestjs/common';
import type { Skill } from '../../domain/entities/skill.domain';
import type { ISkillRepository } from '../../domain/repositories/i-skill.repository';
import { REPOSITORY_TOKEN } from '../../skills.di-tokens';

export type SkillsGroupedByCategory = { category: string; skills: Skill[] }[];

@Injectable()
export class GetAllSkillsUseCase {
  constructor(
    @Inject(REPOSITORY_TOKEN)
    private readonly skills: ISkillRepository,
  ) {}

  async execute(): Promise<SkillsGroupedByCategory> {
    const all = await this.skills.findAll();
    const map = new Map<string, Skill[]>();
    for (const s of all) {
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, skills]) => ({ category, skills }));
  }
}
