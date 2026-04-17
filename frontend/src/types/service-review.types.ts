export type ServiceReviewPublic = {
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

export type ServiceReviewsListResponse = {
  items: ServiceReviewPublic[];
  total: number;
  verifiedInPage: number;
};
