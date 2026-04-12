import type { Profile } from '../entities';

export interface CreateProfileData {
  userId: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  district?: string | null;
  whatsappNumber?: string | null;
  portfolioImages?: string[] | null;
  hourlyRate?: string | null;
  isAvailable?: boolean;
  skillIds?: string[];
}

export type UpdateProfilePatch = Partial<
  Pick<
    Profile,
    | 'displayName'
    | 'bio'
    | 'avatarUrl'
    | 'district'
    | 'whatsappNumber'
    | 'portfolioImages'
    | 'hourlyRate'
    | 'isAvailable'
  >
> & { skillIds?: string[] };

export interface ProfileSearchFilters {
  skillIds?: string[];
  skillId?: string;
  skillName?: string;
  district?: string;
  isAvailable?: boolean;
  maxHourlyRate?: number;
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export type ProfileSearchPage = {
  items: Profile[];
  total: number;
};

export interface IProfileRepository {
  create(data: CreateProfileData): Promise<Profile>;
  updateByUserId(
    userId: string,
    patch: UpdateProfilePatch,
  ): Promise<Profile | null>;
  findByUserId(userId: string): Promise<Profile | null>;
  search(filters: ProfileSearchFilters): Promise<ProfileSearchPage>;
}
