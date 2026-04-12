import type {
  TokenTransaction,
  TokenTransactionStatus,
} from '../entities/token-transaction.domain';

export type TokenHistoryPage = {
  items: TokenTransaction[];
  total: number;
  page: number;
  limit: number;
};

export interface ITokenRepository {
  getBalance(userId: string): Promise<number>;
  findByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<TokenHistoryPage>;
  updateStatus(id: string, status: TokenTransactionStatus): Promise<void>;
  mergeMetadata(id: string, patch: Record<string, unknown>): Promise<void>;
  setRespondedAtIfRecipient(params: {
    transactionId: string;
    actingUserId: string;
    respondedAt: Date;
  }): Promise<boolean>;
  sendContactPair(params: {
    fromUserId: string;
    toUserId: string;
  }): Promise<void>;
  grantManualTokens(params: {
    toUserId: string;
    amount: number;
    createdByAdminId: string;
  }): Promise<void>;
  findRefundEligibleContactReceived(before: Date): Promise<TokenTransaction[]>;
  findCompletedContactSentByPairId(
    pairId: string,
  ): Promise<TokenTransaction | null>;
  hasCompletedRefundForPair(pairId: string): Promise<boolean>;
  applyContactRefund(params: {
    pairId: string;
    senderUserId: string;
    contactReceivedId: string;
  }): Promise<void>;
}
