import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ClientRequestCommentOrmEntity } from '../../../client-requests/infrastructure/persistence/entities/client-request-comment.orm';
import { ClientRequestOrmEntity } from '../../../client-requests/infrastructure/persistence/entities/client-request.orm';
import { ServiceOrmEntity } from '../../../services/infrastructure/persistence/entities/service.orm';
import { UserOrmEntity } from '../../../users/infrastructure/persistence/entities/user.orm-entity';
import { ModerationReportOrmEntity } from '../../infrastructure/persistence/entities/moderation-report.orm-entity';

@Injectable()
export class ApplyModerationReportUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(
    reportId: string,
    adminUserId: string,
    reviewNote?: string | null,
  ): Promise<{ ok: true }> {
    return this.dataSource.transaction(async (manager) => {
      const reportRepo = manager.getRepository(ModerationReportOrmEntity);
      const row = await reportRepo.findOne({ where: { id: reportId } });
      if (!row) {
        throw new NotFoundException('Reporte no encontrado');
      }
      if (row.reviewStatus !== 'pending') {
        throw new BadRequestException('Este reporte ya fue revisado');
      }

      switch (row.targetType) {
        case 'service': {
          const svc = await manager.getRepository(ServiceOrmEntity).findOne({
            where: { id: row.targetId },
          });
          if (!svc) throw new NotFoundException('Servicio no encontrado');
          svc.status = 'PAUSADA';
          await manager.getRepository(ServiceOrmEntity).save(svc);
          break;
        }
        case 'client_request': {
          const req = await manager
            .getRepository(ClientRequestOrmEntity)
            .findOne({ where: { id: row.targetId } });
          if (!req) throw new NotFoundException('Solicitud no encontrada');
          req.status = 'OCULTA';
          await manager.getRepository(ClientRequestOrmEntity).save(req);
          break;
        }
        case 'client_request_comment': {
          const c = await manager
            .getRepository(ClientRequestCommentOrmEntity)
            .findOne({ where: { id: row.targetId } });
          if (!c) throw new NotFoundException('Comentario no encontrado');
          c.moderationHiddenAt = new Date();
          await manager.getRepository(ClientRequestCommentOrmEntity).save(c);
          break;
        }
        case 'user': {
          const u = await manager.getRepository(UserOrmEntity).findOne({
            where: { id: row.targetId },
          });
          if (!u) throw new NotFoundException('Usuario no encontrado');
          if (u.id === adminUserId) {
            throw new BadRequestException(
              'No puedes desactivar tu propia cuenta desde un reporte',
            );
          }
          u.isActive = false;
          await manager.getRepository(UserOrmEntity).save(u);
          break;
        }
        default:
          throw new BadRequestException('Tipo de objetivo no válido');
      }

      row.reviewStatus = 'actioned';
      row.reviewedAt = new Date();
      row.reviewedBy = { id: adminUserId } as UserOrmEntity;
      row.reviewNote = reviewNote?.trim() || null;
      await reportRepo.save(row);
      return { ok: true };
    });
  }
}
