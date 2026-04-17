import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories';
import { UserRole } from '../../../users/domain/entities/user';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import { freelancerDefaultDisplayName } from '../../../profiles/application/utils/freelancer-default-display-name';
import type { IProfileRepository } from '../../../profiles/domain/repositories/profile.repository.interface';
import { PROFILE_REPOSITORY } from '../../../profiles/profiles.di-tokens';
import type { IServiceRepository } from '../../domain/repositories/i-service.repository';
import { SERVICE_REPOSITORY } from '../../services.di-tokens';
import type { CreateServiceBodyDto } from '../dto/create-service.dto';
import {
  toServiceResponse,
  type ServiceResponse,
} from '../mappers/service-response.mapper';
import { assertTimedPromoValid } from '../service-promo.validation';

@Injectable()
export class CreateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profiles: IProfileRepository,
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(
    userId: string,
    dto: CreateServiceBodyDto,
  ): Promise<ServiceResponse> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    let profile = await this.profiles.findByUserId(userId);
    if (!profile) {
      if (user.role !== UserRole.Freelancer) {
        throw new BadRequestException(
          'Solo los perfiles de freelancer pueden crear servicios. Completa tu registro como freelancer o contacta soporte.',
        );
      }
      profile = await this.profiles.create({
        userId,
        displayName: freelancerDefaultDisplayName(user.fullName, user.email),
      });
    }
    const listPrice = dto.listPrice ?? null;
    const promoEndsAt =
      dto.promoEndsAt != null && String(dto.promoEndsAt).trim() !== ''
        ? new Date(dto.promoEndsAt)
        : null;
    assertTimedPromoValid({
      price: dto.price ?? null,
      listPrice,
      promoEndsAt,
    });
    if (dto.status && dto.status !== 'BORRADOR') {
      throw new BadRequestException(
        'Los servicios nuevos solo se pueden crear como borrador',
      );
    }
    const created = await this.services.create({
      title: dto.title,
      description: dto.description,
      price: dto.price ?? null,
      listPrice,
      promoEndsAt,
      currency: 'PEN',
      coverImageUrl: dto.coverImageUrl ?? null,
      isFeatured: dto.isFeatured ?? false,
      status: dto.status ?? 'BORRADOR',
      tags: dto.tags ?? [],
      category: dto.category,
      deliveryMode: dto.deliveryMode,
      deliveryTime: dto.deliveryTime,
      revisionsIncluded: dto.revisionsIncluded,
      profileId: profile.id,
      userId,
    });
    return toServiceResponse(created);
  }
}
