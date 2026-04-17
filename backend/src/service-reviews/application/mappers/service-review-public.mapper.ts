import type { ProfileOrmEntity } from '../../../profiles/infrastructure/persistence/entities/profile.orm-entity';
import type { ServiceReviewOrmEntity } from '../../infrastructure/persistence/entities/service-review.orm-entity';
import { ratingLabelEs } from '../../infrastructure/utils/rating-label';

export type ServiceReviewPublicDto = {
  id: string;
  authorName: string;
  avatarUrl: string | null;
  rating: number;
  ratingLabel: string;
  body: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
  serviceId: string;
  serviceTitle: string;
};

export function toServiceReviewPublicDto(input: {
  id: string;
  displayNameOrFullName: string;
  avatarUrl: string | null;
  rating: number;
  body: string;
  createdAt: Date;
  isVerifiedPurchase: boolean;
  serviceId: string;
  serviceTitle: string;
}): ServiceReviewPublicDto {
  const authorName = input.displayNameOrFullName.trim() || 'Usuario';
  return {
    id: input.id,
    authorName,
    avatarUrl: input.avatarUrl,
    rating: input.rating,
    ratingLabel: ratingLabelEs(input.rating),
    body: input.body,
    createdAt: input.createdAt.toISOString(),
    isVerifiedPurchase: input.isVerifiedPurchase,
    serviceId: input.serviceId,
    serviceTitle: input.serviceTitle,
  };
}

export function serviceReviewToPublicDto(
  row: ServiceReviewOrmEntity,
  profile: ProfileOrmEntity | undefined,
  serviceId: string,
  serviceTitle: string,
): ServiceReviewPublicDto {
  const name =
    profile?.displayName?.trim() || row.author.fullName?.trim() || 'Usuario';
  return toServiceReviewPublicDto({
    id: row.id,
    displayNameOrFullName: name,
    avatarUrl: profile?.avatarUrl ?? null,
    rating: row.rating,
    body: row.body,
    createdAt: row.createdAt,
    isVerifiedPurchase: row.isVerifiedPurchase,
    serviceId,
    serviceTitle,
  });
}
