import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
export class ToggleServiceActiveUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    private readonly publicationSlots: PublicationSlotsAvailabilityService,
  ) {}

  async execute(id: string, userId: string): Promise<ServiceResponse> {
    const existing = await this.services.findById(id);
    if (!existing) {
      throw new NotFoundException('Servicio no encontrado');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('No puedes modificar este servicio');
    }
    if (existing.status !== 'ACTIVA' && existing.status !== 'PAUSADA') {
      throw new BadRequestException(
        'Solo puedes alternar publicaciones activas o pausadas',
      );
    }
    if (existing.status === 'PAUSADA') {
      const owner = await this.users.findById(userId);
      if (owner) {
        assertUserEmailVerified(owner);
      }
      await this.publicationSlots.assertMayKeepServiceFeatured({
        userId,
        profileId: existing.profileId,
        serviceId: existing.id,
        willBeActive: true,
        isFeatured: existing.isFeatured,
      });
    }
    const updated = await this.services.update(id, {
      status: existing.status === 'ACTIVA' ? 'PAUSADA' : 'ACTIVA',
    });
    if (!updated) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return toServiceResponse(updated);
  }
}
