export type ServiceCurrency = 'PEN';
export type ServiceStatus =
  | 'ACTIVA'
  | 'BORRADOR'
  | 'PAUSADA'
  | 'EN_REVISION'
  | 'REQUIERE_CAMBIOS';

export class Service {
  id: string;
  title: string;
  description: string;
  price: number | null;
  /** Precio de referencia si hay oferta temporal (listPrice en BD). */
  listPrice?: number | null;
  promoEndsAt?: Date | null;
  currency: ServiceCurrency;
  coverImageUrl: string | null;
  isFeatured: boolean;
  status: ServiceStatus;
  /** Compatibilidad temporal para clientes existentes. */
  isActive: boolean;
  viewCount: number;
  reviewCount: number;
  reviewAverage: number;
  tags: string[];
  category: string;
  deliveryMode: string;
  deliveryTime: string;
  revisionsIncluded: string;
  moderationComment?: string | null;
  submittedAt?: Date | null;
  reviewedAt?: Date | null;
  reviewedByUserId?: string | null;
  profileId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  /** Solo en lecturas con join a perfil (feed, detalle). */
  profileDisplayName?: string;
  profileAvatarUrl?: string | null;
  profileIsAvailable?: boolean;
}
