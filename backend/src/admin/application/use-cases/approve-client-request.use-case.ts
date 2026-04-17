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
export class ApproveClientRequestUseCase {
  constructor(
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(
    id: string,
    adminUserId: string,
  ): Promise<ClientRequestOrmEntity> {
    const row = await this.requestRepo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    if (row.status !== 'EN_REVISION') {
      throw new BadRequestException(
        'Solo puedes aprobar solicitudes en revisión',
      );
    }
    row.status = 'OPEN';
    row.reviewedAt = new Date();
    row.reviewedByUserId = adminUserId;
    row.moderationComment = null;
    const saved = await this.requestRepo.save(row);
    await this.notifications.createForUser({
      userId: saved.userId,
      type: NotificationType.ClientRequestApproved,
      title: 'Tu solicitud fue aprobada',
      body: `«${saved.title}» ya está publicada.`,
      linkPath: `/solicitar/${saved.id}`,
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
