import type { Service } from '../../domain/entities/service.domain';

export type ServiceResponse = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  /** Precio habitual (oferta); mismo valor que listPrice en BD. */
  previousPrice: number | null;
  /** Fin de oferta temporal; mismo instante que promoEndsAt en BD. */
  flashDealEndsAt: string | null;
  currency: 'PEN';
  coverImageUrl: string | null;
  isFeatured: boolean;
  status: Service['status'];
  isActive: boolean;
  viewCount: number;
  reviewCount: number;
  reviewAverage: number;
  tags: string[];
  category: string;
  deliveryMode: string;
  deliveryTime: string;
  revisionsIncluded: string;
  moderationComment: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  profileId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    displayName: string;
    avatarUrl: string | null;
    isAvailable: boolean;
  };
};

export function toServiceResponse(s: Service): ServiceResponse {
  const listPrice = s.listPrice ?? null;
  const promoEnds = s.promoEndsAt ?? null;
  const base: ServiceResponse = {
    id: s.id,
    title: s.title,
    description: s.description,
    price: s.price,
    previousPrice: listPrice,
    flashDealEndsAt: promoEnds ? promoEnds.toISOString() : null,
    currency: s.currency,
    coverImageUrl: s.coverImageUrl,
    isFeatured: s.isFeatured ?? false,
    status: s.status,
    isActive: s.status === 'ACTIVA',
    viewCount: s.viewCount,
    reviewCount: s.reviewCount ?? 0,
    reviewAverage: s.reviewAverage ?? 0,
    tags: s.tags,
    category: s.category,
    deliveryMode: s.deliveryMode,
    deliveryTime: s.deliveryTime,
    revisionsIncluded: s.revisionsIncluded,
    moderationComment: s.moderationComment ?? null,
    submittedAt: s.submittedAt ? s.submittedAt.toISOString() : null,
    reviewedAt: s.reviewedAt ? s.reviewedAt.toISOString() : null,
    reviewedByUserId: s.reviewedByUserId ?? null,
    profileId: s.profileId,
    userId: s.userId,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
  if (s.profileDisplayName !== undefined) {
    base.profile = {
      displayName: s.profileDisplayName,
      avatarUrl: s.profileAvatarUrl ?? null,
      isAvailable: s.profileIsAvailable ?? false,
    };
  }
  return base;
}
