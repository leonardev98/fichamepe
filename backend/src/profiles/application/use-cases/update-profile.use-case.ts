import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IProfileRepository } from '../../domain/repositories';
import type { Profile } from '../../domain/entities';
import { PROFILE_REPOSITORY } from '../../profiles.di-tokens';
import type { UpdateProfileBodyDto } from '../dto/update-profile.dto';

export interface UpdateProfileCommand {
  targetUserId: string;
  actorUserId: string;
  patch: UpdateProfileBodyDto;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profiles: IProfileRepository,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<Profile> {
    if (command.targetUserId !== command.actorUserId) {
      throw new ForbiddenException();
    }
    const updated = await this.profiles.updateByUserId(command.targetUserId, {
      displayName: command.patch.displayName,
      bio: command.patch.bio,
      avatarUrl: command.patch.avatarUrl,
      district: command.patch.district,
      whatsappNumber: command.patch.whatsappNumber,
      portfolioImages: command.patch.portfolioImages,
      hourlyRate: command.patch.hourlyRate,
      isAvailable: command.patch.isAvailable,
      skillIds: command.patch.skillIds,
    });
    if (!updated) {
      throw new NotFoundException('Perfil no encontrado');
    }
    return updated;
  }
}
