import { Inject, Injectable } from '@nestjs/common';
import type {
  IProfileRepository,
  ProfileSearchFilters,
} from '../../domain/repositories';
import type { Profile } from '../../domain/entities';
import { PROFILE_REPOSITORY } from '../../profiles.di-tokens';

export type SearchProfilesResult = {
  data: Profile[];
  total: number;
  page: number;
  limit: number;
};

@Injectable()
export class SearchProfilesUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profiles: IProfileRepository,
  ) {}

  async execute(filters: ProfileSearchFilters): Promise<SearchProfilesResult> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;
    const { items, total } = await this.profiles.search({
      ...filters,
      page,
      limit,
    });
    return { data: items, total, page, limit };
  }
}
