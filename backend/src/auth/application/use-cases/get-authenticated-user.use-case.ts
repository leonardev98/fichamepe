import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories';
import type { SafeUser } from '../../../users/domain/entities';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';

@Injectable()
export class GetAuthenticatedUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(userId: string): Promise<SafeUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { password: _p, ...safe } = user;
    return safe;
  }
}
