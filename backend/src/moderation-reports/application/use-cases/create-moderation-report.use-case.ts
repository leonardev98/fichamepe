import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SERVICE_REPOSITORY } from '../../../services/services.di-tokens';
import type { IServiceRepository } from '../../../services/domain/repositories/i-service.repository';
import { ClientRequestCommentOrmEntity } from '../../../client-requests/infrastructure/persistence/entities/client-request-comment.orm';
import { ClientRequestOrmEntity } from '../../../client-requests/infrastructure/persistence/entities/client-request.orm';
import { UserOrmEntity } from '../../../users/infrastructure/persistence/entities/user.orm-entity';
import { CreateModerationReportDto } from '../dto/create-moderation-report.dto';
import { ModerationReportOrmEntity } from '../../infrastructure/persistence/entities/moderation-report.orm-entity';

@Injectable()
export class CreateModerationReportUseCase {
  constructor(
    @InjectRepository(ModerationReportOrmEntity)
    private readonly reportRepo: Repository<ModerationReportOrmEntity>,
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
    @InjectRepository(ClientRequestCommentOrmEntity)
    private readonly commentRepo: Repository<ClientRequestCommentOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
  ) {}

  async execute(
    reporterUserId: string,
    dto: CreateModerationReportDto,
  ): Promise<{ id: string }> {
    const details = dto.details?.trim() || null;
    const ownerUserId = await this.resolveOwnerUserId(dto);
    if (ownerUserId === reporterUserId) {
      throw new BadRequestException('No puedes reportar tu propio contenido');
    }

    const existing = await this.reportRepo.findOne({
      where: {
        targetType: dto.targetType,
        targetId: dto.targetId,
        reporter: { id: reporterUserId },
      },
      relations: ['reporter'],
    });

    if (existing) {
      existing.reason = dto.reason;
      existing.details = details;
      existing.reviewStatus = 'pending';
      existing.reviewedAt = null;
      existing.reviewedBy = null;
      existing.reviewNote = null;
      await this.reportRepo.save(existing);
      return { id: existing.id };
    }

    const row = this.reportRepo.create({
      targetType: dto.targetType,
      targetId: dto.targetId,
      reporter: { id: reporterUserId } as UserOrmEntity,
      reason: dto.reason,
      details,
      reviewStatus: 'pending',
    });
    const saved = await this.reportRepo.save(row);
    return { id: saved.id };
  }

  private async resolveOwnerUserId(
    dto: CreateModerationReportDto,
  ): Promise<string> {
    switch (dto.targetType) {
      case 'service': {
        const svc = await this.services.findById(dto.targetId);
        if (!svc) throw new NotFoundException('Servicio no encontrado');
        return svc.userId;
      }
      case 'client_request': {
        const req = await this.requestRepo.findOne({
          where: { id: dto.targetId },
        });
        if (!req) throw new NotFoundException('Solicitud no encontrada');
        return req.userId;
      }
      case 'client_request_comment': {
        const c = await this.commentRepo.findOne({
          where: { id: dto.targetId },
        });
        if (!c) throw new NotFoundException('Comentario no encontrado');
        return c.userId;
      }
      case 'user': {
        const u = await this.userRepo.findOne({ where: { id: dto.targetId } });
        if (!u) throw new NotFoundException('Usuario no encontrado');
        return u.id;
      }
      default:
        throw new BadRequestException('Tipo de objetivo no válido');
    }
  }
}
