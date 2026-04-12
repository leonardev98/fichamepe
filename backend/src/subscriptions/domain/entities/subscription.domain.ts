export enum SubscriptionPlan {
  Pro = 'pro',
}

export enum SubscriptionStatus {
  Active = 'active',
  PendingPayment = 'pending_payment',
  Expired = 'expired',
  Cancelled = 'cancelled',
}

export class Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  activatedAt: Date | null;
  expiresAt: Date | null;
  activatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
