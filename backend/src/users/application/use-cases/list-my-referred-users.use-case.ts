import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories';
import { USER_REPOSITORY } from '../../users.di-tokens';

export type ReferredUserListItem = {
  id: string;
  fullName: string | null;
  createdAt: string;
};

@Injectable()
export class ListMyReferredUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(userId: string): Promise<{ items: ReferredUserListItem[] }> {
    const rows = await this.users.findReferredUsersByReferrerId(userId);
    return {
      items: rows.map((r) => ({
        id: r.id,
        fullName: r.fullName,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }
}
