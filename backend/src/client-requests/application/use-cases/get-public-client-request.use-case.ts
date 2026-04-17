import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientRequestApplicationOrmEntity } from '../../infrastructure/persistence/entities/client-request-application.orm';
import { ClientRequestOrmEntity } from '../../infrastructure/persistence/entities/client-request.orm';

export type PublicClientRequestDetail = {
  id: string;
  title: string;
  detail: string | null;
  budget: string;
  createdAt: Date;
  applicantsCount: number;
  /** Dueño de la solicitud (para ocultar “reportar” al autor). */
  ownerUserId: string;
};

@Injectable()
export class GetPublicClientRequestUseCase {
  constructor(
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
    @InjectRepository(ClientRequestApplicationOrmEntity)
    private readonly applicationRepo: Repository<ClientRequestApplicationOrmEntity>,
  ) {}

  async execute(id: string): Promise<PublicClientRequestDetail> {
    const row = await this.requestRepo.findOne({ where: { id } });
    if (!row || row.status !== 'OPEN') {
      throw new NotFoundException('Solicitud no encontrada');
    }
    const applicantsCount = await this.applicationRepo.count({
      where: { requestId: id },
    });
    return {
      id: row.id,
      title: row.title,
      detail: row.detail,
      budget: row.budget,
      createdAt: row.createdAt,
      applicantsCount,
      ownerUserId: row.userId,
    };
  }
}
