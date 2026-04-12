import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { Profile, ProfileSkill } from '../../../domain/entities';
import type {
  CreateProfileData,
  IProfileRepository,
  ProfileSearchFilters,
  ProfileSearchPage,
  UpdateProfilePatch,
} from '../../../domain/repositories';
import { UserOrmEntity } from '../../../../users/infrastructure/persistence/entities/user.orm-entity';
import { ProfileOrmEntity } from '../entities/profile.orm-entity';
import { SkillOrmEntity } from '../../../../skills/infrastructure/persistence/entities/skill.orm';

function mapSkill(s: SkillOrmEntity): ProfileSkill {
  const ps = new ProfileSkill();
  ps.id = s.id;
  ps.name = s.name;
  ps.category = s.category;
  return ps;
}

function toDomain(row: ProfileOrmEntity): Profile {
  const p = new Profile();
  p.id = row.id;
  p.userId = row.user?.id ?? '';
  p.displayName = row.displayName;
  p.bio = row.bio;
  p.avatarUrl = row.avatarUrl;
  p.district = row.district;
  p.whatsappNumber = row.whatsappNumber;
  p.portfolioImages = row.portfolioImages;
  p.hourlyRate = row.hourlyRate;
  p.isAvailable = row.isAvailable;
  p.skills = (row.skills ?? []).map(mapSkill);
  return p;
}

@Injectable()
export class ProfileTypeOrmRepository implements IProfileRepository {
  constructor(
    @InjectRepository(ProfileOrmEntity)
    private readonly profiles: Repository<ProfileOrmEntity>,
    @InjectRepository(SkillOrmEntity)
    private readonly skills: Repository<SkillOrmEntity>,
  ) {}

  async create(data: CreateProfileData): Promise<Profile> {
    const row = this.profiles.create({
      displayName: data.displayName,
      bio: data.bio ?? null,
      avatarUrl: data.avatarUrl ?? null,
      district: data.district ?? null,
      whatsappNumber: data.whatsappNumber ?? null,
      portfolioImages: data.portfolioImages ?? null,
      hourlyRate: data.hourlyRate ?? null,
      isAvailable: data.isAvailable ?? true,
      user: { id: data.userId } as unknown as UserOrmEntity,
    });
    let saved = await this.profiles.save(row);
    if (data.skillIds?.length) {
      const skillRows = await this.skills.findBy({ id: In(data.skillIds) });
      saved.skills = skillRows;
      saved = await this.profiles.save(saved);
    }
    const withRels = await this.profiles.findOne({
      where: { id: saved.id },
      relations: ['user', 'skills'],
    });
    return toDomain(withRels!);
  }

  async updateByUserId(
    userId: string,
    patch: UpdateProfilePatch,
  ): Promise<Profile | null> {
    const row = await this.profiles.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'skills'],
    });
    if (!row) {
      return null;
    }
    if (patch.displayName !== undefined) {
      row.displayName = patch.displayName;
    }
    if (patch.bio !== undefined) {
      row.bio = patch.bio;
    }
    if (patch.avatarUrl !== undefined) {
      row.avatarUrl = patch.avatarUrl;
    }
    if (patch.district !== undefined) {
      row.district = patch.district;
    }
    if (patch.whatsappNumber !== undefined) {
      row.whatsappNumber = patch.whatsappNumber;
    }
    if (patch.portfolioImages !== undefined) {
      row.portfolioImages = patch.portfolioImages;
    }
    if (patch.hourlyRate !== undefined) {
      row.hourlyRate = patch.hourlyRate;
    }
    if (patch.isAvailable !== undefined) {
      row.isAvailable = patch.isAvailable;
    }
    if (patch.skillIds !== undefined) {
      if (patch.skillIds.length === 0) {
        row.skills = [];
      } else {
        row.skills = await this.skills.findBy({ id: In(patch.skillIds) });
      }
    }
    await this.profiles.save(row);
    const reloaded = await this.profiles.findOne({
      where: { id: row.id },
      relations: ['user', 'skills'],
    });
    return reloaded ? toDomain(reloaded) : null;
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    const row = await this.profiles.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'skills'],
    });
    return row ? toDomain(row) : null;
  }

  async search(filters: ProfileSearchFilters): Promise<ProfileSearchPage> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 12));
    const skip = (page - 1) * limit;

    const skillIdSet = new Set<string>();
    for (const id of filters.skillIds ?? []) {
      skillIdSet.add(id);
    }
    if (filters.skillId) {
      skillIdSet.add(filters.skillId);
    }
    const skillIdsFilter = [...skillIdSet];

    const applyFilters = (qb: ReturnType<Repository<ProfileOrmEntity>['createQueryBuilder']>) => {
      if (skillIdsFilter.length) {
        qb.andWhere(
          (sq) =>
            `EXISTS (${sq
              .subQuery()
              .select('1')
              .from(ProfileOrmEntity, 'ip')
              .innerJoin('ip.skills', 'isk')
              .where('ip.id = p.id')
              .andWhere('isk.id IN (:...skillIdsFilter)')
              .getQuery()})`,
        );
        qb.setParameter('skillIdsFilter', skillIdsFilter);
      }
      if (filters.skillName?.trim()) {
        qb.andWhere(
          (sq) =>
            `EXISTS (${sq
              .subQuery()
              .select('1')
              .from(ProfileOrmEntity, 'ipn')
              .innerJoin('ipn.skills', 'iskn')
              .where('ipn.id = p.id')
              .andWhere('LOWER(iskn.name) = LOWER(:skillNameExact)')
              .getQuery()})`,
        );
        qb.setParameter('skillNameExact', filters.skillName.trim());
      }
      if (filters.category?.trim()) {
        qb.andWhere(
          (sq) =>
            `EXISTS (${sq
              .subQuery()
              .select('1')
              .from(ProfileOrmEntity, 'ipc')
              .innerJoin('ipc.skills', 'iskc')
              .where('ipc.id = p.id')
              .andWhere('iskc.category = :profileSkillCategory')
              .getQuery()})`,
        );
        qb.setParameter('profileSkillCategory', filters.category.trim());
      }
      if (filters.district?.trim()) {
        qb.andWhere('LOWER(p.district) LIKE LOWER(:districtLike)', {
          districtLike: `%${filters.district.trim()}%`,
        });
      }
      if (filters.isAvailable !== undefined) {
        qb.andWhere('p.isAvailable = :isAvailable', {
          isAvailable: filters.isAvailable,
        });
      }
      if (filters.maxHourlyRate !== undefined) {
        qb.andWhere('p.hourlyRate IS NOT NULL');
        qb.andWhere('CAST(p.hourlyRate AS DECIMAL(10,2)) <= :maxHourlyRate', {
          maxHourlyRate: filters.maxHourlyRate,
        });
      }
      if (filters.search?.trim()) {
        const term = `%${filters.search.trim().toLowerCase()}%`;
        qb.setParameter('searchTerm', term);
        const skillNameSearchSql = (sq: typeof qb) =>
          `EXISTS (${sq
            .subQuery()
            .select('1')
            .from(ProfileOrmEntity, 'ips')
            .innerJoin('ips.skills', 'isks')
            .where('ips.id = p.id')
            .andWhere('LOWER(isks.name) LIKE :searchTerm')
            .getQuery()})`;
        qb.andWhere(
          new Brackets((w) => {
            w.where('LOWER(p.displayName) LIKE :searchTerm')
              .orWhere("LOWER(COALESCE(p.bio, '')) LIKE :searchTerm")
              .orWhere((sq) => skillNameSearchSql(sq));
          }),
        );
      }
    };

    const countQb = this.profiles.createQueryBuilder('p');
    applyFilters(countQb);
    const total = await countQb.getCount();

    const idQb = this.profiles
      .createQueryBuilder('p')
      .select('p.id', 'id')
      .orderBy('p.displayName', 'ASC')
      .skip(skip)
      .take(limit);
    applyFilters(idQb);
    const rawIds = await idQb.getRawMany<{ id: string }>();
    const ids = rawIds.map((r) => r.id);

    if (ids.length === 0) {
      return { items: [], total };
    }

    const rows = await this.profiles.find({
      where: { id: In(ids) },
      relations: ['user', 'skills'],
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((r): r is ProfileOrmEntity => r !== undefined);
    return { items: ordered.map(toDomain), total };
  }
}
