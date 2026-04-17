import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IProfileRepository } from '../../../profiles/domain/repositories';
import { PROFILE_REPOSITORY } from '../../../profiles/profiles.di-tokens';
import type { IUserRepository } from '../../../users/domain/repositories';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import type { IServiceRepository } from '../../../services/domain/repositories/i-service.repository';
import { SERVICE_REPOSITORY } from '../../../services/services.di-tokens';
import type { AuthenticatedUserResponse } from '../types/authenticated-user-response';

@Injectable()
export class GetAuthenticatedUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profiles: IProfileRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
  ) {}

  async execute(userId: string): Promise<AuthenticatedUserResponse> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const profile = await this.profiles.findByUserId(userId);
    const publicationCount = profile
      ? await this.services.countByProfileId(profile.id)
      : 0;
    const publicationActiveCount = profile
      ? await this.services.countActiveByProfileId(profile.id)
      : 0;
    const directReferrals = await this.users.countUsersReferredBy(user.id);
    const isPublicationExempt = true;
    const publicationBaseActiveMax = null;
    const publicationActiveMax = null;
    const featuredActiveCount = profile
      ? await this.services.countActiveFeaturedByProfileId(profile.id)
      : 0;
    const {
      password: _p,
      referredByUserId,
      referralMigrationCredits: _credits,
      emailVerifiedAt,
      ...safePublic
    } = user;
    return {
      ...safePublic,
      emailVerified: !!emailVerifiedAt,
      avatarUrl: profile?.avatarUrl ?? null,
      hasReferredBy: referredByUserId != null,
      publicationCount,
      publicationActiveCount,
      publicationActiveMax,
      publicationBaseActiveMax,
      publicationMax: publicationActiveMax,
      isPublicationExempt,
      featuredActiveCount,
      featuredActiveMax: directReferrals,
      referralDirectCount: directReferrals,
    };
  }
}
