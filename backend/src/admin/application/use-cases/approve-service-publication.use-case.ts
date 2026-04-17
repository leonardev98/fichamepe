import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IServiceRepository } from '../../../services/domain/repositories/i-service.repository';
import { SERVICE_REPOSITORY } from '../../../services/services.di-tokens';
import {
  toServiceResponse,
  type ServiceResponse,
} from '../../../services/application/mappers/service-response.mapper';
import { PublicationSlotsAvailabilityService } from '../../../services/application/services/publication-slots-availability.service';
import { NotificationType } from '../../../notifications/domain/notification-type';
import { NotificationsService } from '../../../notifications/notifications.service';
import { revalidateSiteCache } from '../../../common/seo/revalidate-site-cache';

@Injectable()
export class ApproveServicePublicationUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
    private readonly publicationSlots: PublicationSlotsAvailabilityService,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(id: string, adminUserId: string): Promise<ServiceResponse> {
    const existing = await this.services.findById(id);
    if (!existing) {
      throw new NotFoundException('Servicio no encontrado');
    }
    if (existing.status !== 'EN_REVISION') {
      throw new BadRequestException(
        'Solo puedes aprobar publicaciones en revisión',
      );
    }
    await this.publicationSlots.assertMayKeepServiceFeatured({
      userId: existing.userId,
      profileId: existing.profileId,
      serviceId: existing.id,
      willBeActive: true,
      isFeatured: existing.isFeatured,
    });
    const updated = await this.services.update(id, {
      status: 'ACTIVA',
      reviewedAt: new Date(),
      reviewedByUserId: adminUserId,
      moderationComment: null,
    });
    if (!updated) {
      throw new NotFoundException('Servicio no encontrado');
    }
    await this.notifications.createForUser({
      userId: updated.userId,
      type: NotificationType.ServicePublicationApproved,
      title: 'Tu publicación fue aprobada',
      body: `«${updated.title}» ya está visible en el marketplace.`,
      linkPath: `/servicios/${updated.id}`,
    });
    await revalidateSiteCache({
      paths: [
        '/',
        '/explorar',
        `/servicios/${updated.id}`,
        `/perfil/${updated.profileId}`,
      ],
      tags: [
        'services:feed',
        `service:${updated.id}`,
        `profile:${updated.profileId}:services`,
        'sitemap:services',
      ],
    });
    return toServiceResponse(updated);
  }
}
