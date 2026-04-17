import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientRequestApplicationOrmEntity } from '../../infrastructure/persistence/entities/client-request-application.orm';
import { ClientRequestOrmEntity } from '../../infrastructure/persistence/entities/client-request.orm';

export type OpenClientRequestRow = {
  id: string;
  title: string;
  budget: string;
  applicantsCount: number;
  createdAt: Date;
};

@Injectable()
export class ListOpenClientRequestsUseCase {
  constructor(
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
    @InjectRepository(ClientRequestApplicationOrmEntity)
    private readonly applicationRepo: Repository<ClientRequestApplicationOrmEntity>,
  ) {}

  async execute(limit: number): Promise<OpenClientRequestRow[]> {
    const take = Math.min(50, Math.max(1, limit));
    const requests = await this.requestRepo.find({
      where: { status: 'OPEN' },
      order: { createdAt: 'DESC' },
      take,
    });
    if (requests.length === 0) {
      return [];
    }
    const ids = requests.map((r) => r.id);
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
    return requests.map((r) => ({
      id: r.id,
      title: r.title,
      budget: r.budget,
      applicantsCount: countMap.get(r.id) ?? 0,
      createdAt: r.createdAt,
    }));
  }
}
