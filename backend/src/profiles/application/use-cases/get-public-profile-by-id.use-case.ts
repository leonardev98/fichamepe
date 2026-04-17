import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { PROFILE_REPOSITORY } from '../../profiles.di-tokens';
import type { IProfileRepository } from '../../domain/repositories';

export type PublicProfileResponse = {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  district: string | null;
  portfolioImages: string[] | null;
  hourlyRate: string | null;
  isAvailable: boolean;
  skills: Array<{
    id: string;
    name: string;
    category: string;
  }>;
};

@Injectable()
export class GetPublicProfileByIdUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profiles: IProfileRepository,
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(profileId: string): Promise<PublicProfileResponse> {
    const profile = await this.profiles.findById(profileId);
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }
    const owner = await this.users.findById(profile.userId);
    if (!owner?.isActive) {
      throw new NotFoundException('Perfil no encontrado');
    }

    // Nunca exponer datos sensibles (ej. whatsapp) en la vista pública.
    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      district: profile.district,
      portfolioImages: profile.portfolioImages,
      hourlyRate: profile.hourlyRate,
      isAvailable: profile.isAvailable,
      skills: profile.skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
      })),
    };
  }
}
