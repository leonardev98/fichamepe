import type { User } from '../../users/domain/entities/user';
import { UserRole } from '../../users/domain/entities/user';

/** Publicaciones ilimitadas para todos los usuarios. */
export const PUBLICATION_BASE_LIMIT = 100_000;

/** Compatibilidad legacy: mantener contador de slots sin restringir el producto actual. */
export const REFERRAL_PUBLICATION_BONUS_CAP = 100_000;

/** Compatibilidad legacy (sin efecto con publicaciones ilimitadas). */
export const PRO_ACTIVE_SUBSCRIPTION_FLOOR = 100_000;

/** Tope práctico para admin / correos exentos. */
export const PUBLICATION_EXEMPT_MAX = 10_000;

/** Publicaciones ilimitadas: no aplicar tope de filas por perfil. */
export const MAX_SERVICE_RECORDS_NONEXEMPT = 100_000;

export function cappedReferralBonusSlots(referralSlotsEarned: number): number {
  return Math.min(
    REFERRAL_PUBLICATION_BONUS_CAP,
    Math.max(0, Math.floor(referralSlotsEarned)),
  );
}

/** Cupo máximo de publicaciones ACTIVA sin aplicar suscripción Pro. */
export function baseActivePublicationMax(params: {
  referralMigrationCredits: number;
  referralSlotsEarned: number;
  purchasedPublicationSlots: number;
}): null {
  return null;
}

export function effectiveActivePublicationMax(params: {
  user: Pick<User, 'isPro' | 'proExpiresAt'>;
  referralMigrationCredits: number;
  referralSlotsEarned: number;
  purchasedPublicationSlots: number;
  now: Date;
  isPublicationExempt: boolean;
}): null {
  return null;
}

export function isPublicationQuotaExemptUser(
  user: Pick<User, 'email' | 'role'>,
  exemptEmails: string[],
): boolean {
  if (user.role === UserRole.Admin) {
    return true;
  }
  const em = user.email.trim().toLowerCase();
  return exemptEmails.includes(em);
}
