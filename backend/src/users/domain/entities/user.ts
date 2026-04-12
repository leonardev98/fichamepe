export enum UserRole {
  Freelancer = 'freelancer',
  Client = 'client',
  Admin = 'admin',
}

export class User {
  id: string;
  email: string;
  fullName: string | null;
  /** Hash almacenado (columna `password` en BD). */
  password: string;
  role: UserRole;
  isActive: boolean;
  isPro: boolean;
  proExpiresAt: Date | null;
  tokenBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<User, 'password'>;
