import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../entities/subscription.domain';

export type CreateSubscriptionInput = {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: string;
  paymentMethod?: string | null;
  paymentReference?: string | null;
};

export type SubscriptionUpdatePatch = Partial<
  Pick<
    Subscription,
    | 'status'
    | 'amount'
    | 'paymentMethod'
    | 'paymentReference'
    | 'activatedAt'
    | 'expiresAt'
    | 'activatedBy'
  >
>;

export interface ISubscriptionRepository {
  create(data: CreateSubscriptionInput): Promise<Subscription>;
  findById(id: string): Promise<Subscription | null>;
  findActiveByUserId(userId: string): Promise<Subscription | null>;
  update(
    id: string,
    patch: SubscriptionUpdatePatch,
  ): Promise<Subscription | null>;
  findActiveExpiredBefore(date: Date): Promise<Subscription[]>;
}
