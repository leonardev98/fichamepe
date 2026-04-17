import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ServiceStatus } from '../../domain/entities/service.domain';
import type { IServiceRepository } from '../../domain/repositories/i-service.repository';
import { SERVICE_REPOSITORY } from '../../services.di-tokens';
import {
  toServiceResponse,
  type ServiceResponse,
} from '../mappers/service-response.mapper';
import { PublicationSlotsAvailabilityService } from '../services/publication-slots-availability.service';
import type { IUserRepository } from '../../../users/domain/repositories';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import { assertUserEmailVerified } from '../../../common/email-verification/assert-user-email-verified';

@Injectable()
export class SetServiceStatusUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    private readonly publicationSlots: PublicationSlotsAvailabilityService,
  ) {}

  async execute(
    id: string,
    userId: string,
    status: ServiceStatus,
  ): Promise<ServiceResponse> {
    const existing = await this.services.findById(id);
    if (!existing) {
      throw new NotFoundException('Servicio no encontrado');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('No puedes modificar este servicio');
    }
    if (status === 'EN_REVISION' || status === 'ACTIVA') {
      const owner = await this.users.findById(userId);
      if (owner) {
        assertUserEmailVerified(owner);
      }
    }
    const patch: {
      status: ServiceStatus;
      submittedAt?: Date | null;
      reviewedAt?: Date | null;
      reviewedByUserId?: string | null;
      moderationComment?: string | null;
    } = { status };

    if (status === 'EN_REVISION') {
      if (
        existing.status !== 'BORRADOR' &&
        existing.status !== 'REQUIERE_CAMBIOS'
      ) {
        throw new BadRequestException(
          'Solo puedes enviar a revisión un borrador o una publicación con cambios solicitados',
        );
      }
      patch.submittedAt = new Date();
      patch.reviewedAt = null;
      patch.reviewedByUserId = null;
      patch.moderationComment = null;
    } else if (status === 'PAUSADA') {
      if (existing.status !== 'ACTIVA') {
        throw new BadRequestException(
          'Solo puedes pausar publicaciones activas',
        );
      }
    } else if (status === 'ACTIVA') {
      if (existing.status !== 'PAUSADA') {
        throw new BadRequestException(
          'Solo puedes reactivar publicaciones pausadas',
        );
      }
      await this.publicationSlots.assertMayKeepServiceFeatured({
        userId,
        profileId: existing.profileId,
        serviceId: existing.id,
        willBeActive: true,
        isFeatured: existing.isFeatured,
      });
    } else if (status === 'BORRADOR') {
      if (existing.status === 'ACTIVA') {
        throw new BadRequestException(
          'No puedes mover una publicación activa a borrador',
        );
      }
    } else {
      throw new BadRequestException('Transición de estado no permitida');
    }

    const updated = await this.services.update(id, patch);
    if (!updated) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return toServiceResponse(updated);
  }
}
