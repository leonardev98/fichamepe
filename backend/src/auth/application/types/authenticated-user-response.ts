import type { SafeUser } from '../../../users/domain/entities';

type SafeUserPublic = Omit<
  SafeUser,
  'referredByUserId' | 'referralMigrationCredits' | 'emailVerifiedAt'
>;

/** Payload de GET /auth/me y respuesta de registro (sin contraseña). */
export type AuthenticatedUserResponse = SafeUserPublic & {
  avatarUrl: string | null;
  hasReferredBy: boolean;
  /** Total de filas de servicio (todos los estados). */
  publicationCount: number;
  /** Publicaciones con estado ACTIVA. */
  publicationActiveCount: number;
  /** Sin tope: publicación ilimitada para todas las cuentas. */
  publicationActiveMax: number | null;
  /** Sin tope: publicación ilimitada para todas las cuentas. */
  publicationBaseActiveMax: number | null;
  /** Compatibilidad legacy; mantiene null cuando no hay tope. */
  publicationMax: number | null;
  isPublicationExempt: boolean;
  /** Publicaciones destacadas actualmente activas. */
  featuredActiveCount: number;
  /** Cupos de destacadas disponibles por referidos directos. */
  featuredActiveMax: number;
  /** Personas que se registraron con tu código (estadística). */
  referralDirectCount: number;
  /** false hasta completar verificación por correo (publicar / chatear). */
  emailVerified: boolean;
};
