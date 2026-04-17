import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import type { IProfileRepository } from '../../../profiles/domain/repositories/profile.repository.interface';
import { PROFILE_REPOSITORY } from '../../../profiles/profiles.di-tokens';
import type { IServiceRepository } from '../../domain/repositories/i-service.repository';
import { SERVICE_REPOSITORY } from '../../services.di-tokens';

@Injectable()
export class PublicationSlotsAvailabilityService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profiles: IProfileRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
  ) {}

  async assertMayActivateOneMore(
    _userId: string,
    _profileId: string,
  ): Promise<void> {
    // Publicaciones activas ilimitadas para todas las cuentas.
  }

  async assertMayKeepServiceFeatured(params: {
    userId: string;
    profileId: string;
    serviceId?: string;
    willBeActive: boolean;
    isFeatured: boolean;
  }): Promise<void> {
    if (!params.willBeActive || !params.isFeatured) {
      return;
    }
    const user = await this.users.findById(params.userId);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    const referrals = await this.users.countUsersReferredBy(params.userId);
    const featuredAlready = await this.services.countActiveFeaturedByProfileId(
      params.profileId,
      params.serviceId,
    );
    if (featuredAlready + 1 > referrals) {
      throw new BadRequestException(
        'No tienes cupos de destacadas suficientes. Cada referido te habilita 1 publicación destacada activa.',
      );
    }
  }

  async reconcileActivePublicationsForUser(userId: string): Promise<number> {
    await this.profiles.findByUserId(userId);
    // Sin tope de activas, no hay reconciliación por cupo.
    return 0;
  }
}
