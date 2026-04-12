export enum TokenTransactionType {
  Purchase = 'purchase',
  ContactSent = 'contact_sent',
  ContactReceived = 'contact_received',
  Refund = 'refund',
  ManualGrant = 'manual_grant',
}

export enum TokenTransactionStatus {
  Pending = 'pending',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export class TokenTransaction {
  id: string;
  fromUserId: string | null;
  toUserId: string;
  amount: number;
  type: TokenTransactionType;
  status: TokenTransactionStatus;
  metadata: Record<string, unknown> | null;
  respondedAt: Date | null;
  createdAt: Date;
}
