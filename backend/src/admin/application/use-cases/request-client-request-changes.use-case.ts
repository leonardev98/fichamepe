import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientRequestOrmEntity } from '../../../client-requests/infrastructure/persistence/entities/client-request.orm';
import { NotificationType } from '../../../notifications/domain/notification-type';
import { NotificationsService } from '../../../notifications/notifications.service';
import { revalidateSiteCache } from '../../../common/seo/revalidate-site-cache';

@Injectable()
export class RequestClientRequestChangesUseCase {
  constructor(
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(
    id: string,
    adminUserId: string,
    comment: string,
  ): Promise<ClientRequestOrmEntity> {
    const row = await this.requestRepo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    if (row.status !== 'EN_REVISION') {
      throw new BadRequestException(
        'Solo puedes pedir cambios a solicitudes en revisión',
      );
    }
    row.status = 'REQUIERE_CAMBIOS';
    row.moderationComment = comment.trim();
    row.reviewedAt = new Date();
    row.reviewedByUserId = adminUserId;
    const saved = await this.requestRepo.save(row);
    const c = comment.trim();
    await this.notifications.createForUser({
      userId: saved.userId,
      type: NotificationType.ClientRequestChangesRequested,
      title: 'Te pidieron cambios en tu solicitud',
      body: `Moderación: ${c.slice(0, 280)}${c.length > 280 ? '…' : ''}`,
      linkPath: '/cuenta/solicitudes',
    });
    await revalidateSiteCache({
      paths: ['/solicitar', `/solicitar/${saved.id}`],
      tags: [
        'client-requests:open',
        `client-request:${saved.id}`,
        'sitemap:client-requests',
      ],
    });
    return saved;
  }
}
