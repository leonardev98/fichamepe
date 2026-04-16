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
import { generateReferralCode } from '../../utils/referral-code.generator';

function normalizeReferralCodeInput(code: string): string {
  return code.trim().toUpperCase();
}

function toDomain(row: UserOrmEntity): User {
  const u = new User();
  u.id = row.id;
  u.email = row.email;
  u.fullName = row.fullName ?? null;
  u.password = row.password ?? null;
  u.googleId = row.googleId ?? null;
  u.role = row.role;
  u.isActive = row.isActive;
  u.isPro = row.isPro;
  u.proExpiresAt = row.proExpiresAt;
  u.tokenBalance = row.tokenBalance;
  u.referralCode = row.referralCode;
  u.referredByUserId = row.referredByUserId ?? null;
  u.referralMigrationCredits = row.referralMigrationCredits ?? 0;
  u.referralSlotsEarned = row.referralSlotsEarned ?? 0;
  u.purchasedPublicationSlots = row.purchasedPublicationSlots ?? 0;
  u.emailVerifiedAt = row.emailVerifiedAt ?? null;
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

  async findByGoogleId(googleId: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { googleId } });
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByReferralCode(code: string): Promise<User | null> {
    const normalized = normalizeReferralCodeInput(code);
    if (!normalized) {
      return null;
    }
    const row = await this.repo.findOne({
      where: { referralCode: normalized },
    });
    return row ? toDomain(row) : null;
  }

  async countUsersReferredBy(referrerUserId: string): Promise<number> {
    return this.repo.count({
      where: { referredByUserId: referrerUserId },
    });
  }

  async applyReferredByIfEmpty(
    userId: string,
    referrerUserId: string,
  ): Promise<boolean> {
    const res = await this.repo
      .createQueryBuilder()
      .update(UserOrmEntity)
      .set({ referredByUserId: referrerUserId })
      .where('id = :userId', { userId })
      .andWhere('referredByUserId IS NULL')
      .execute();
    return (res.affected ?? 0) === 1;
  }

  async create(data: CreateUserData): Promise<User> {
    let referralCode = generateReferralCode(10);
    for (let i = 0; i < 20; i++) {
      const taken = await this.repo.findOne({
        where: { referralCode },
        select: ['id'],
      });
      if (!taken) break;
      referralCode = generateReferralCode(10);
    }
    const row = this.repo.create({
      email: data.email.trim().toLowerCase(),
      fullName: data.fullName?.trim() ? data.fullName.trim() : null,
      password: data.passwordHash ?? null,
      googleId: data.googleId ?? null,
      role: data.role ?? UserRole.Freelancer,
      referralCode,
      referredByUserId: data.referredByUserId ?? null,
      referralMigrationCredits: 0,
      ...(data.markEmailVerified
        ? { emailVerifiedAt: new Date() }
        : {}),
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
      const nextEmail = patch.email.trim().toLowerCase();
      if (row.email !== nextEmail) {
        row.email = nextEmail;
        row.emailVerifiedAt = null;
        row.emailVerificationToken = null;
        row.emailVerificationExpires = null;
        row.emailVerificationLastSentAt = null;
      }
    }
    if (patch.fullName !== undefined) {
      const raw = patch.fullName;
      const t = raw == null ? '' : raw.trim();
      row.fullName = t.length ? t : null;
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
    if (patch.googleId !== undefined) {
      row.googleId = patch.googleId;
    }
    const saved = await this.repo.save(row);
    return toDomain(saved);
  }

  async setPasswordResetByEmail(
    email: string,
    token: string,
    expires: Date,
  ): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    const res = await this.repo.update(
      { email: normalized },
      { passwordResetToken: token, passwordResetExpires: expires },
    );
    return (res.affected ?? 0) > 0;
  }

  async consumePasswordReset(
    token: string,
    newPasswordHash: string,
  ): Promise<boolean> {
    const row = await this.repo.findOne({
      where: { passwordResetToken: token },
    });
    if (
      !row ||
      !row.passwordResetExpires ||
      row.passwordResetExpires.getTime() <= Date.now()
    ) {
      return false;
    }
    row.password = newPasswordHash;
    row.passwordResetToken = null;
    row.passwordResetExpires = null;
    await this.repo.save(row);
    return true;
  }

  async setEmailVerificationByUserId(
    userId: string,
    token: string,
    expires: Date,
    lastSentAt: Date,
  ): Promise<void> {
    await this.repo.update(
      { id: userId },
      {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
        emailVerificationLastSentAt: lastSentAt,
      },
    );
  }

  async consumeEmailVerification(token: string): Promise<boolean> {
    const row = await this.repo.findOne({
      where: { emailVerificationToken: token },
    });
    if (
      !row ||
      !row.emailVerificationExpires ||
      row.emailVerificationExpires.getTime() <= Date.now()
    ) {
      return false;
    }
    row.emailVerifiedAt = new Date();
    row.emailVerificationToken = null;
    row.emailVerificationExpires = null;
    row.emailVerificationLastSentAt = null;
    await this.repo.save(row);
    return true;
  }

  async getEmailVerificationLastSentAt(userId: string): Promise<Date | null> {
    const row = await this.repo.findOne({
      where: { id: userId },
      select: ['emailVerificationLastSentAt'],
    });
    return row?.emailVerificationLastSentAt ?? null;
  }

  async incrementReferralSlotsEarnedCapped(
    referrerUserId: string,
    cap: number,
  ): Promise<void> {
    const row = await this.repo.findOne({ where: { id: referrerUserId } });
    if (!row) {
      return;
    }
    const cur = row.referralSlotsEarned ?? 0;
    const next = Math.min(cap, cur + 1);
    await this.repo.update(referrerUserId, { referralSlotsEarned: next });
  }

  async incrementPurchasedPublicationSlots(
    userId: string,
    delta: number,
  ): Promise<void> {
    if (delta <= 0) {
      return;
    }
    await this.repo.increment(
      { id: userId },
      'purchasedPublicationSlots',
      delta,
    );
  }
}
