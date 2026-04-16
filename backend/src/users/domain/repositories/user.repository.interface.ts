import type { User, UserRole } from '../entities';

export interface CreateUserData {
  email: string;
  /** Null = cuenta solo Google (sin contraseña local). */
  passwordHash?: string | null;
  googleId?: string | null;
  fullName?: string | null;
  role?: UserRole;
  referredByUserId?: string | null;
  /** Si true, marca el correo como verificado al crear (p. ej. OAuth Google). */
  markEmailVerified?: boolean;
}

export type UserUpdatePatch = Partial<
  Pick<
    User,
    | 'email'
    | 'fullName'
    | 'isActive'
    | 'isPro'
    | 'proExpiresAt'
    | 'tokenBalance'
    | 'role'
    | 'googleId'
  >
>;

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByReferralCode(code: string): Promise<User | null>;
  countUsersReferredBy(referrerUserId: string): Promise<number>;
  /**
   * Asigna referidor solo si aún no tenía uno. Devuelve true si se actualizó.
   */
  applyReferredByIfEmpty(userId: string, referrerUserId: string): Promise<boolean>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, patch: UserUpdatePatch): Promise<User | null>;
  /** Devuelve true si existía un usuario con ese correo. */
  setPasswordResetByEmail(
    email: string,
    token: string,
    expires: Date,
  ): Promise<boolean>;
  /** Actualiza contraseña y borra token si el token es válido y no ha expirado. */
  consumePasswordReset(token: string, newPasswordHash: string): Promise<boolean>;

  setEmailVerificationByUserId(
    userId: string,
    token: string,
    expires: Date,
    lastSentAt: Date,
  ): Promise<void>;

  /** Marca correo verificado y limpia tokens si el token es válido y no ha expirado. */
  consumeEmailVerification(token: string): Promise<boolean>;

  getEmailVerificationLastSentAt(userId: string): Promise<Date | null>;

  /** Suma 1 al contador de cupos por referido del referidor, sin superar `cap`. */
  incrementReferralSlotsEarnedCapped(
    referrerUserId: string,
    cap: number,
  ): Promise<void>;

  /** Suma slots comprados cumplidos al usuario. */
  incrementPurchasedPublicationSlots(userId: string, delta: number): Promise<void>;
}
