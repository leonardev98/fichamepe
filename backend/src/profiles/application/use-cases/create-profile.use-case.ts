import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import type { IProfileRepository } from '../../domain/repositories';
import type { Profile } from '../../domain/entities';
import { PROFILE_REPOSITORY } from '../../profiles.di-tokens';
import type { CreateProfileBodyDto } from '../dto/create-profile.dto';

@Injectable()
export class CreateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profiles: IProfileRepository,
  ) {}

  async execute(userId: string, dto: CreateProfileBodyDto): Promise<Profile> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const existing = await this.profiles.findByUserId(userId);
    if (existing) {
      throw new ConflictException('El usuario ya tiene un perfil');
    }
    return this.profiles.create({
      userId,
      displayName: dto.displayName,
      bio: dto.bio,
      avatarUrl: dto.avatarUrl,
      district: dto.district,
      whatsappNumber: dto.whatsappNumber,
      portfolioImages: dto.portfolioImages,
      hourlyRate: dto.hourlyRate,
      isAvailable: dto.isAvailable,
      skillIds: dto.skillIds,
    });
  }
}
