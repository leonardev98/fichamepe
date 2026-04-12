import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  IsNull,
  LessThan,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { UserOrmEntity } from '../../../../users/infrastructure/persistence/entities/user.orm-entity';
import {
  TokenTransaction,
  TokenTransactionStatus,
  TokenTransactionType,
} from '../../../domain/entities/token-transaction.domain';
import type {
  ITokenRepository,
  TokenHistoryPage,
} from '../../../domain/repositories/i-token.repository';
import { TokenTransactionOrmEntity } from '../entities/token-transaction.orm';

function toDomain(row: TokenTransactionOrmEntity): TokenTransaction {
  const t = new TokenTransaction();
  t.id = row.id;
  t.fromUserId = row.fromUser?.id ?? null;
  t.toUserId = row.toUser.id;
  t.amount = row.amount;
  t.type = row.type;
  t.status = row.status;
  t.metadata = row.metadata;
  t.respondedAt = row.respondedAt ?? null;
  t.createdAt = row.createdAt;
  return t;
}

@Injectable()
export class TokenTransactionTypeOrmRepository implements ITokenRepository {
  constructor(
    @InjectRepository(TokenTransactionOrmEntity)
    private readonly repo: Repository<TokenTransactionOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly users: Repository<UserOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private pairIdWhere(alias: string): string {
    const t = this.dataSource.options.type;
    if (t === 'postgres') {
      return `${alias}.metadata->>'pairId' = :pairId`;
    }
    return `json_extract(${alias}.metadata, '$.pairId') = :pairId`;
  }

  private applyPairId(
    qb: SelectQueryBuilder<TokenTransactionOrmEntity>,
    alias: string,
    pairId: string,
  ): void {
    qb.andWhere(this.pairIdWhere(alias), { pairId });
  }

  async getBalance(userId: string): Promise<number> {
    const u = await this.users.findOne({
      where: { id: userId },
      select: ['id', 'tokenBalance'],
    });
    return u?.tokenBalance ?? 0;
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<TokenHistoryPage> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const qb = this.repo
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.fromUser', 'fromUser')
      .leftJoinAndSelect('tx.toUser', 'toUser')
      .where('(tx.fromUserId = :uid OR tx.toUserId = :uid)', { uid: userId })
      .orderBy('tx.createdAt', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);
    const [rows, total] = await qb.getManyAndCount();
    return {
      items: rows.map(toDomain),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async updateStatus(
    id: string,
    status: TokenTransactionStatus,
  ): Promise<void> {
    await this.repo.update({ id }, { status });
  }

  async mergeMetadata(
    id: string,
    patch: Record<string, unknown>,
  ): Promise<void> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      return;
    }
    row.metadata = { ...(row.metadata ?? {}), ...patch };
    await this.repo.save(row);
  }

  async setRespondedAtIfRecipient(params: {
    transactionId: string;
    actingUserId: string;
    respondedAt: Date;
  }): Promise<boolean> {
    const row = await this.repo.findOne({
      where: {
        id: params.transactionId,
        type: TokenTransactionType.ContactReceived,
      },
      relations: ['toUser'],
    });
    if (!row || row.toUser.id !== params.actingUserId) {
      return false;
    }
    row.respondedAt = params.respondedAt;
    await this.repo.save(row);
    return true;
  }

  async sendContactPair(params: {
    fromUserId: string;
    toUserId: string;
  }): Promise<void> {
    const pairId = randomUUID();
    await this.dataSource.transaction(async (em) => {
      const userRepo = em.getRepository(UserOrmEntity);
      const txRepo = em.getRepository(TokenTransactionOrmEntity);
      const from = await userRepo.findOne({ where: { id: params.fromUserId } });
      const to = await userRepo.findOne({ where: { id: params.toUserId } });
      if (!from || !to) {
        throw new Error('USER_NOT_FOUND');
      }
      if (from.tokenBalance < 1) {
        throw new Error('INSUFFICIENT_BALANCE');
      }
      from.tokenBalance -= 1;
      await userRepo.save(from);
      const sent = txRepo.create({
        fromUser: from,
        toUser: to,
        amount: -1,
        type: TokenTransactionType.ContactSent,
        status: TokenTransactionStatus.Completed,
        metadata: { pairId },
        respondedAt: null,
      });
      const received = txRepo.create({
        fromUser: from,
        toUser: to,
        amount: 0,
        type: TokenTransactionType.ContactReceived,
        status: TokenTransactionStatus.Completed,
        metadata: { pairId },
        respondedAt: null,
      });
      await txRepo.save(sent);
      await txRepo.save(received);
    });
  }

  async grantManualTokens(params: {
    toUserId: string;
    amount: number;
    createdByAdminId: string;
  }): Promise<void> {
    await this.dataSource.transaction(async (em) => {
      const userRepo = em.getRepository(UserOrmEntity);
      const txRepo = em.getRepository(TokenTransactionOrmEntity);
      const to = await userRepo.findOne({ where: { id: params.toUserId } });
      if (!to) {
        throw new Error('USER_NOT_FOUND');
      }
      to.tokenBalance += params.amount;
      await userRepo.save(to);
      const grant = txRepo.create({
        fromUser: null,
        toUser: to,
        amount: params.amount,
        type: TokenTransactionType.ManualGrant,
        status: TokenTransactionStatus.Completed,
        metadata: { grantedByAdminId: params.createdByAdminId },
        respondedAt: null,
      });
      await txRepo.save(grant);
    });
  }

  async findRefundEligibleContactReceived(
    before: Date,
  ): Promise<TokenTransaction[]> {
    const rows = await this.repo.find({
      where: {
        type: TokenTransactionType.ContactReceived,
        status: TokenTransactionStatus.Completed,
        respondedAt: IsNull(),
        createdAt: LessThan(before),
      },
      relations: ['fromUser', 'toUser'],
      order: { createdAt: 'ASC' },
      take: 200,
    });
    return rows
      .filter((r) => {
        const meta = r.metadata;
        return !meta?.refundIssued;
      })
      .map(toDomain);
  }

  async findCompletedContactSentByPairId(
    pairId: string,
  ): Promise<TokenTransaction | null> {
    const qb = this.repo
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.fromUser', 'fromUser')
      .leftJoinAndSelect('tx.toUser', 'toUser')
      .where('tx.type = :type', { type: TokenTransactionType.ContactSent })
      .andWhere('tx.status = :st', { st: TokenTransactionStatus.Completed });
    this.applyPairId(qb, 'tx', pairId);
    const row = await qb.getOne();
    return row ? toDomain(row) : null;
  }

  async hasCompletedRefundForPair(pairId: string): Promise<boolean> {
    const qb = this.repo
      .createQueryBuilder('tx')
      .where('tx.type = :type', { type: TokenTransactionType.Refund })
      .andWhere('tx.status = :st', { st: TokenTransactionStatus.Completed });
    this.applyPairId(qb, 'tx', pairId);
    const n = await qb.getCount();
    return n > 0;
  }

  async applyContactRefund(params: {
    pairId: string;
    senderUserId: string;
    contactReceivedId: string;
  }): Promise<void> {
    await this.dataSource.transaction(async (em) => {
      const userRepo = em.getRepository(UserOrmEntity);
      const txRepo = em.getRepository(TokenTransactionOrmEntity);
      const sender = await userRepo.findOne({
        where: { id: params.senderUserId },
      });
      if (!sender) {
        return;
      }
      const received = await txRepo.findOne({
        where: { id: params.contactReceivedId },
      });
      if (!received) {
        return;
      }
      const meta = received.metadata ?? {};
      if (meta.refundIssued) {
        return;
      }
      sender.tokenBalance += 1;
      await userRepo.save(sender);
      const refund = txRepo.create({
        fromUser: null,
        toUser: sender,
        amount: 1,
        type: TokenTransactionType.Refund,
        status: TokenTransactionStatus.Completed,
        metadata: {
          pairId: params.pairId,
          purpose: 'contact_no_response_48h',
        },
        respondedAt: null,
      });
      await txRepo.save(refund);
      received.metadata = {
        ...meta,
        pairId: params.pairId,
        refundIssued: true,
      };
      await txRepo.save(received);
    });
  }
}
