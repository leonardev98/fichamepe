import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientRequestOrmEntity } from '../../infrastructure/persistence/entities/client-request.orm';

@Injectable()
export class ResubmitClientRequestUseCase {
  constructor(
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
  ) {}

  async execute(requestId: string, ownerUserId: string): Promise<ClientRequestOrmEntity> {
    const row = await this.requestRepo.findOne({ where: { id: requestId } });
    if (!row) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    if (row.userId !== ownerUserId) {
      throw new ForbiddenException('No puedes reenviar esta solicitud');
    }
    if (row.status !== 'REQUIERE_CAMBIOS') {
      throw new BadRequestException(
        'Solo puedes reenviar solicitudes con correcciones pendientes',
      );
    }
    row.status = 'EN_REVISION';
    row.submittedAt = new Date();
    row.moderationComment = null;
    return this.requestRepo.save(row);
  }
}
