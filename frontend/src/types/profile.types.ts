export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  district: string | null;
  hourlyRate: number | null;
  isAvailable: boolean;
  skills: Skill[];
  rating?: number;
}

export interface SearchFilters {
  skill?: string | string[];
  district?: string;
  isAvailable?: boolean;
  maxHourlyRate?: number;
  search?: string;
  category?: string;
}
