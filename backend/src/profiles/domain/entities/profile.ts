export class ProfileSkill {
  id: string;
  name: string;
  category: string;
}

export class Profile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  district: string | null;
  whatsappNumber: string | null;
  portfolioImages: string[] | null;
  hourlyRate: string | null;
  isAvailable: boolean;
  skills: ProfileSkill[];
}
