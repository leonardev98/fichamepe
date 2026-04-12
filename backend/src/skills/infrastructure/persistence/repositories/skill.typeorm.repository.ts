import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../../../domain/entities/skill.domain';
import type {
  ISkillRepository,
  SkillSeedItem,
} from '../../../domain/repositories/i-skill.repository';
import { SkillOrmEntity } from '../entities/skill.orm';

function toDomain(row: SkillOrmEntity): Skill {
  const s = new Skill();
  s.id = row.id;
  s.name = row.name;
  s.category = row.category;
  s.createdAt = row.createdAt;
  return s;
}

@Injectable()
export class SkillTypeOrmRepository implements ISkillRepository {
  constructor(
    @InjectRepository(SkillOrmEntity)
    private readonly repo: Repository<SkillOrmEntity>,
  ) {}

  async findAll(): Promise<Skill[]> {
    const rows = await this.repo.find({
      order: { category: 'ASC', name: 'ASC' },
    });
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Skill | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByCategory(category: string): Promise<Skill[]> {
    const rows = await this.repo.find({
      where: { category },
      order: { name: 'ASC' },
    });
    return rows.map(toDomain);
  }

  async create(data: Pick<Skill, 'name' | 'category'>): Promise<Skill> {
    const row = this.repo.create({
      name: data.name.trim(),
      category: data.category.trim(),
    });
    const saved = await this.repo.save(row);
    return toDomain(saved);
  }

  async seed(items: SkillSeedItem[]): Promise<void> {
    for (const { name, category } of items) {
      const exists = await this.repo.exists({
        where: { name: name.trim() },
      });
      if (!exists) {
        await this.repo.save(
          this.repo.create({
            name: name.trim(),
            category: category.trim(),
          }),
        );
      }
    }
  }
}
