import type { User, UserRole } from '../entities';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName?: string | null;
  role?: UserRole;
}

export type UserUpdatePatch = Partial<
  Pick<
    User,
    'email' | 'isActive' | 'isPro' | 'proExpiresAt' | 'tokenBalance' | 'role'
  >
>;

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, patch: UserUpdatePatch): Promise<User | null>;
}
