export type UserRole = "freelancer" | "client" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
  countryCode: string | null;
  /** Foto pública del perfil (misma URL que en S3); null si no hay perfil o sin avatar. */
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  isPro: boolean;
  proExpiresAt: string | null;
  tokenBalance: number;
  referralCode: string;
  hasReferredBy: boolean;
  /** Total de fichas (todos los estados). */
  publicationCount: number;
  /** Solo estado ACTIVA (visibles en vitrina). */
  publicationActiveCount: number;
  /** Tope de ACTIVA según plan, referidos y compras. */
  publicationActiveMax: number | null;
  /** Tope de ACTIVA sin el impulso del Plan Pro (base + referidos + compras + migración). */
  publicationBaseActiveMax: number | null;
  /** null = sin tope práctico (admin / cuenta exenta). Mismo valor que publicationActiveMax si aplica. */
  publicationMax: number | null;
  isPublicationExempt: boolean;
  /** Destacadas activas en este momento. */
  featuredActiveCount: number;
  /** Cupos de destacadas por referidos directos (1:1). */
  featuredActiveMax: number;
  /** Cuántas personas se registraron con tu código (informativo). */
  referralDirectCount: number;
  /** Cupos ganados por referidos (el tope aplicado en servidor es 3). */
  referralSlotsEarned: number;
  /** Slots comprados de por vida (suma cumplida). */
  purchasedPublicationSlots: number;
  /**
   * false hasta verificar el correo (publicar o chatear).
   * Si el backend no envía el campo (cliente antiguo), se asume true al normalizar.
   */
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};
