import type { Skill } from '../entities/skill.domain';

export type SkillSeedItem = { name: string; category: string };

export interface ISkillRepository {
  findAll(): Promise<Skill[]>;
  findById(id: string): Promise<Skill | null>;
  findByCategory(category: string): Promise<Skill[]>;
  create(data: Pick<Skill, 'name' | 'category'>): Promise<Skill>;
  seed(items: SkillSeedItem[]): Promise<void>;
}
