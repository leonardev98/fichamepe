import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../../domain/entities';
import type {
  CreateUserData,
  IUserRepository,
  UserUpdatePatch,
} from '../../../domain/repositories';
import { UserOrmEntity } from '../entities/user.orm-entity';

function toDomain(row: UserOrmEntity): User {
  const u = new User();
  u.id = row.id;
  u.email = row.email;
  u.fullName = row.fullName ?? null;
  u.password = row.password;
  u.role = row.role;
  u.isActive = row.isActive;
  u.isPro = row.isPro;
  u.proExpiresAt = row.proExpiresAt;
  u.tokenBalance = row.tokenBalance;
  u.createdAt = row.createdAt;
  u.updatedAt = row.updatedAt;
  return u;
}

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const row = await this.repo.findOne({ where: { email: normalized } });
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const row = this.repo.create({
      email: data.email.trim().toLowerCase(),
      fullName: data.fullName?.trim() ? data.fullName.trim() : null,
      password: data.passwordHash,
      role: data.role ?? UserRole.Freelancer,
    });
    const saved = await this.repo.save(row);
    return toDomain(saved);
  }

  async update(id: string, patch: UserUpdatePatch): Promise<User | null> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      return null;
    }
    if (patch.email !== undefined) {
      row.email = patch.email.trim().toLowerCase();
    }
    if (patch.isActive !== undefined) {
      row.isActive = patch.isActive;
    }
    if (patch.isPro !== undefined) {
      row.isPro = patch.isPro;
    }
    if (patch.proExpiresAt !== undefined) {
      row.proExpiresAt = patch.proExpiresAt;
    }
    if (patch.tokenBalance !== undefined) {
      row.tokenBalance = patch.tokenBalance;
    }
    if (patch.role !== undefined) {
      row.role = patch.role;
    }
    const saved = await this.repo.save(row);
    return toDomain(saved);
  }
}
