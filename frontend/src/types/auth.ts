export type UserRole = "freelancer" | "client" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  isActive: boolean;
  isPro: boolean;
  proExpiresAt: string | null;
  tokenBalance: number;
  createdAt: string;
  updatedAt: string;
};
