import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories';
import type { SafeUser } from '../../domain/entities';
import { USER_REPOSITORY } from '../../users.di-tokens';
import type { UpdateUserBodyDto } from '../dto/update-user.dto';

export interface UpdateUserCommand {
  targetUserId: string;
  actorUserId: string;
  patch: UpdateUserBodyDto;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<SafeUser> {
    if (command.targetUserId !== command.actorUserId) {
      throw new ForbiddenException();
    }
    const existing = await this.users.findById(command.targetUserId);
    if (!existing) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (command.patch.email !== undefined) {
      const other = await this.users.findByEmail(command.patch.email);
      if (other && other.id !== command.targetUserId) {
        throw new ConflictException('El correo ya está registrado');
      }
    }
    const updated = await this.users.update(command.targetUserId, {
      email: command.patch.email,
      isActive: command.patch.isActive,
      isPro: command.patch.isPro,
      proExpiresAt: command.patch.proExpiresAt,
      tokenBalance: command.patch.tokenBalance,
      role: command.patch.role,
    });
    if (!updated) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const { password: _p, ...safe } = updated;
    return safe;
  }
}
