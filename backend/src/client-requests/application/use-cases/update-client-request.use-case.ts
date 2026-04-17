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
export class UpdateClientRequestUseCase {
  constructor(
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
  ) {}

  async execute(
    requestId: string,
    ownerUserId: string,
    input: { title: string; detail: string | null | undefined; budget: string },
  ): Promise<ClientRequestOrmEntity> {
    const row = await this.requestRepo.findOne({ where: { id: requestId } });
    if (!row) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    if (row.userId !== ownerUserId) {
      throw new ForbiddenException('No puedes editar esta solicitud');
    }
    if (row.status !== 'REQUIERE_CAMBIOS') {
      throw new BadRequestException(
        'Solo puedes editar solicitudes con correcciones pendientes',
      );
    }
    row.title = input.title.trim();
    row.detail = input.detail?.trim() ? input.detail.trim() : null;
    row.budget = input.budget.trim();
    return this.requestRepo.save(row);
  }
}
