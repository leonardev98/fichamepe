import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProfileRepository } from '../../domain/repositories';
import type { Profile } from '../../domain/entities';
import { PROFILE_REPOSITORY } from '../../profiles.di-tokens';

@Injectable()
export class GetProfileByUserIdUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profiles: IProfileRepository,
  ) {}

  async execute(userId: string): Promise<Profile> {
    const profile = await this.profiles.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }
    return profile;
  }
}
