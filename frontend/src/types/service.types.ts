export type ServiceProfileSummary = {
  displayName: string;
  avatarUrl: string | null;
  isAvailable: boolean;
  rating?: number;
  reviewCount?: number;
  responseTimeHours?: number;
  isVerified?: boolean;
  district?: string | null;
};

export type ServiceBadgeKey =
  | "topRated"
  | "fastResponse"
  | "new"
  | "premium"
  | "bestSeller";

export type ServiceStatus =
  | "ACTIVA"
  | "BORRADOR"
  | "PAUSADA"
  | "EN_REVISION"
  | "REQUIERE_CAMBIOS";

export type ServicePublic = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  previousPrice?: number | null;
  currency: "PEN";
  coverImageUrl: string | null;
  isFeatured?: boolean;
  status: ServiceStatus;
  isActive: boolean;
  viewCount: number;
  /** Agregados de reseñas de esta publicación (compradores). */
  reviewCount?: number;
  reviewAverage?: number;
  tags: string[];
  category: string;
  deliveryMode: string;
  deliveryTime: string;
  revisionsIncluded: string;
  moderationComment?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedByUserId?: string | null;
  profileId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  profile?: ServiceProfileSummary;
  badge?: ServiceBadgeKey;
  weeklyHires?: number;
  etaHours?: number;
  distanceKm?: number | null;
  flashDealEndsAt?: string | null;
  remainingSlots?: number;
  soldRatio?: number;
  testimonial?: string | null;
};

export type ServicesFeedResponse = {
  services: ServicePublic[];
  total: number;
};
