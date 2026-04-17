import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientRequestOrmEntity } from '../../infrastructure/persistence/entities/client-request.orm';

export type CreatedClientRequest = {
  id: string;
  title: string;
  budget: string;
  applicantsCount: number;
  createdAt: Date;
  status: string;
};

@Injectable()
export class CreateClientRequestUseCase {
  constructor(
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
  ) {}

  async execute(
    userId: string,
    input: { title: string; detail: string | null | undefined; budget: string },
  ): Promise<CreatedClientRequest> {
    const now = new Date();
    const row = this.requestRepo.create({
      userId,
      title: input.title.trim(),
      detail: input.detail?.trim() ? input.detail.trim() : null,
      budget: input.budget.trim(),
      status: 'EN_REVISION',
      submittedAt: now,
    });
    const saved = await this.requestRepo.save(row);
    return {
      id: saved.id,
      title: saved.title,
      budget: saved.budget,
      applicantsCount: 0,
      createdAt: saved.createdAt,
      status: saved.status,
    };
  }
}
