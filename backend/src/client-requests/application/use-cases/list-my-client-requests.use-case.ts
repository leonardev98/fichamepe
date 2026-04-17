import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ClientRequestApplicationOrmEntity } from '../../infrastructure/persistence/entities/client-request-application.orm';
import { ClientRequestOrmEntity } from '../../infrastructure/persistence/entities/client-request.orm';

export type MyClientRequestRow = {
  id: string;
  title: string;
  budget: string;
  detail: string | null;
  status: string;
  moderationComment: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  applicantsCount: number;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ListMyClientRequestsUseCase {
  constructor(
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
    @InjectRepository(ClientRequestApplicationOrmEntity)
    private readonly applicationRepo: Repository<ClientRequestApplicationOrmEntity>,
  ) {}

  async execute(
    userId: string,
    statusFilter:
      | 'EN_REVISION'
      | 'OPEN'
      | 'REQUIERE_CAMBIOS'
      | 'OCULTA'
      | 'all',
  ): Promise<MyClientRequestRow[]> {
    const where: FindOptionsWhere<ClientRequestOrmEntity> = { userId };
    if (statusFilter !== 'all') {
      where.status = statusFilter;
    }
    const rows = await this.requestRepo.find({
      where,
      order: { updatedAt: 'DESC' },
      take: 100,
    });
    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id);
    const raw = await this.applicationRepo
      .createQueryBuilder('a')
      .select('a.requestId', 'requestId')
      .addSelect('COUNT(*)', 'cnt')
      .where('a.requestId IN (:...ids)', { ids })
      .groupBy('a.requestId')
      .getRawMany<{ requestId: string; cnt: string }>();
    const countMap = new Map<string, number>();
    for (const row of raw) {
      countMap.set(row.requestId, Number(row.cnt) || 0);
    }
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      budget: r.budget,
      detail: r.detail,
      status: r.status,
      moderationComment: r.moderationComment,
      submittedAt: r.submittedAt,
      reviewedAt: r.reviewedAt,
      applicantsCount: countMap.get(r.id) ?? 0,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }
}
