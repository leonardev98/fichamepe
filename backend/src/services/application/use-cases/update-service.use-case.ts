import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import { assertUserEmailVerified } from '../../../common/email-verification/assert-user-email-verified';
import type { IServiceRepository } from '../../domain/repositories/i-service.repository';
import { SERVICE_REPOSITORY } from '../../services.di-tokens';
import type { Service } from '../../domain/entities/service.domain';
import type { UpdateServiceBodyDto } from '../dto/update-service.dto';
import {
  toServiceResponse,
  type ServiceResponse,
} from '../mappers/service-response.mapper';
import { assertTimedPromoValid } from '../service-promo.validation';
import { PublicationSlotsAvailabilityService } from '../services/publication-slots-availability.service';

@Injectable()
export class UpdateServiceUseCase {
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
    dto: UpdateServiceBodyDto,
  ): Promise<ServiceResponse> {
    const existing = await this.services.findById(id);
    if (!existing) {
      throw new NotFoundException('Servicio no encontrado');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('No puedes editar este servicio');
    }

    const nextPrice = dto.price !== undefined ? dto.price : existing.price;
    let nextList = existing.listPrice ?? null;
    let nextPromo = existing.promoEndsAt ?? null;
    const nextIsFeatured =
      dto.isFeatured !== undefined ? dto.isFeatured : existing.isFeatured;
    if (dto.listPrice !== undefined) {
      nextList = dto.listPrice;
    }
    if (dto.promoEndsAt !== undefined) {
      nextPromo =
        dto.promoEndsAt === null || dto.promoEndsAt === ''
          ? null
          : new Date(dto.promoEndsAt);
    }
    if (dto.listPrice === null || dto.promoEndsAt === null) {
      nextList = null;
      nextPromo = null;
    }
    assertTimedPromoValid(
      {
        price: nextPrice,
        listPrice: nextList,
        promoEndsAt: nextPromo,
      },
      { allowExpiredPersisted: true },
    );

    const patch: Partial<Service> = {};
    if (dto.title !== undefined) {
      patch.title = dto.title;
    }
    if (dto.description !== undefined) {
      patch.description = dto.description;
    }
    if (dto.price !== undefined) {
      patch.price = dto.price;
    }
    if (dto.coverImageUrl !== undefined) {
      patch.coverImageUrl = dto.coverImageUrl;
    }
    if (dto.status !== undefined) {
      if (dto.status === 'ACTIVA') {
        throw new BadRequestException(
          'Usa la acción de reactivar para volver a publicar una pausa',
        );
      }
      if (dto.status === 'EN_REVISION') {
        if (existing.status === 'REQUIERE_CAMBIOS') {
          patch.status = 'EN_REVISION';
          patch.submittedAt = new Date();
          patch.reviewedAt = null;
          patch.reviewedByUserId = null;
          patch.moderationComment = null;
        } else if (existing.status === 'EN_REVISION') {
          // Guardar campos sin reenviar ni tocar fechas de moderación.
        } else {
          throw new BadRequestException(
            'Usa la acción de publicar para enviar un borrador a revisión',
          );
        }
      } else if (dto.status === 'REQUIERE_CAMBIOS') {
        throw new BadRequestException(
          'El estado de cambios solicitados solo lo puede definir un administrador',
        );
      } else {
        patch.status = dto.status;
      }
    }
    if (dto.tags !== undefined) {
      patch.tags = dto.tags;
    }
    if (dto.category !== undefined) {
      patch.category = dto.category;
    }
    if (dto.deliveryMode !== undefined) {
      patch.deliveryMode = dto.deliveryMode;
    }
    if (dto.deliveryTime !== undefined) {
      patch.deliveryTime = dto.deliveryTime;
    }
    if (dto.revisionsIncluded !== undefined) {
      patch.revisionsIncluded = dto.revisionsIncluded;
    }
    if (dto.listPrice !== undefined || dto.promoEndsAt !== undefined) {
      patch.listPrice = nextList;
      patch.promoEndsAt = nextPromo;
    }
    if (dto.isFeatured !== undefined) {
      patch.isFeatured = dto.isFeatured;
    }
    const nextStatus = patch.status ?? existing.status;
    await this.publicationSlots.assertMayKeepServiceFeatured({
      userId,
      profileId: existing.profileId,
      serviceId: existing.id,
      willBeActive: nextStatus === 'ACTIVA',
      isFeatured: nextIsFeatured,
    });
    if (patch.status === 'EN_REVISION') {
      const owner = await this.users.findById(userId);
      if (owner) {
        assertUserEmailVerified(owner);
      }
    }
    const updated = await this.services.update(id, patch);
    if (!updated) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return toServiceResponse(updated);
  }
}
