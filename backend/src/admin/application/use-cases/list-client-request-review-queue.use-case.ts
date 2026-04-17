import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientRequestOrmEntity } from '../../../client-requests/infrastructure/persistence/entities/client-request.orm';

export type AdminClientRequestQueueRow = {
  id: string;
  userId: string;
  title: string;
  detail: string | null;
  budget: string;
  status: string;
  submittedAt: Date | null;
  createdAt: Date;
};

@Injectable()
export class ListClientRequestReviewQueueUseCase {
  constructor(
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
  ) {}

  async execute(): Promise<{ requests: AdminClientRequestQueueRow[] }> {
    const rows = await this.requestRepo.find({
      where: { status: 'EN_REVISION' },
      order: { submittedAt: 'ASC', createdAt: 'ASC' },
      take: 200,
    });
    return {
      requests: rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        title: r.title,
        detail: r.detail,
        budget: r.budget,
        status: r.status,
        submittedAt: r.submittedAt,
        createdAt: r.createdAt,
      })),
    };
  }
}
