import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, IsNull, LessThanOrEqual, Not, Repository } from 'typeorm';
import { UserOrmEntity } from '../../../../users/infrastructure/persistence/entities/user.orm-entity';
import {
  Subscription,
  SubscriptionStatus,
} from '../../../domain/entities/subscription.domain';
import type {
  CreateSubscriptionInput,
  ISubscriptionRepository,
  SubscriptionUpdatePatch,
} from '../../../domain/repositories/i-subscription.repository';
import { SubscriptionOrmEntity } from '../entities/subscription.orm';

function toDomain(row: SubscriptionOrmEntity): Subscription {
  const s = new Subscription();
  s.id = row.id;
  s.userId = row.user.id;
  s.plan = row.plan;
  s.status = row.status;
  s.amount = row.amount;
  s.paymentMethod = row.paymentMethod;
  s.paymentReference = row.paymentReference;
  s.activatedAt = row.activatedAt;
  s.expiresAt = row.expiresAt;
  s.activatedBy = row.activatedBy;
  s.createdAt = row.createdAt;
  s.updatedAt = row.updatedAt;
  return s;
}

@Injectable()
export class SubscriptionTypeOrmRepository implements ISubscriptionRepository {
  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly repo: Repository<SubscriptionOrmEntity>,
  ) {}

  async create(data: CreateSubscriptionInput): Promise<Subscription> {
    const row = this.repo.create({
      user: { id: data.userId } as UserOrmEntity,
      plan: data.plan,
      status: data.status,
      amount: data.amount,
      paymentMethod: data.paymentMethod ?? null,
      paymentReference: data.paymentReference ?? null,
      activatedAt: null,
      expiresAt: null,
      activatedBy: null,
    });
    const saved = await this.repo.save(row);
    const withUser = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
    return toDomain(withUser!);
  }

  async findById(id: string): Promise<Subscription | null> {
    const row = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
    return row ? toDomain(row) : null;
  }

  async findActiveByUserId(userId: string): Promise<Subscription | null> {
    const row = await this.repo.findOne({
      where: {
        user: { id: userId },
        status: SubscriptionStatus.Active,
      },
      relations: ['user'],
    });
    return row ? toDomain(row) : null;
  }

  async update(
    id: string,
    patch: SubscriptionUpdatePatch,
  ): Promise<Subscription | null> {
    const row = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!row) {
      return null;
    }
    if (patch.status !== undefined) {
      row.status = patch.status;
    }
    if (patch.amount !== undefined) {
      row.amount = patch.amount;
    }
    if (patch.paymentMethod !== undefined) {
      row.paymentMethod = patch.paymentMethod;
    }
    if (patch.paymentReference !== undefined) {
      row.paymentReference = patch.paymentReference;
    }
    if (patch.activatedAt !== undefined) {
      row.activatedAt = patch.activatedAt;
    }
    if (patch.expiresAt !== undefined) {
      row.expiresAt = patch.expiresAt;
    }
    if (patch.activatedBy !== undefined) {
      row.activatedBy = patch.activatedBy;
    }
    const saved = await this.repo.save(row);
    return toDomain(saved);
  }

  async findActiveExpiredBefore(date: Date): Promise<Subscription[]> {
    const rows = await this.repo.find({
      where: {
        status: SubscriptionStatus.Active,
        expiresAt: And(Not(IsNull()), LessThanOrEqual(date)),
      },
      relations: ['user'],
      take: 500,
    });
    return rows.map(toDomain);
  }
}
