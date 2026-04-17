/** Valores persistidos en `notification.type` (estables para el cliente). */
export const NotificationType = {
  ServicePublicationApproved: 'SERVICE_PUBLICATION_APPROVED',
  ClientRequestApproved: 'CLIENT_REQUEST_APPROVED',
  ServiceChangesRequested: 'SERVICE_CHANGES_REQUESTED',
  ClientRequestChangesRequested: 'CLIENT_REQUEST_CHANGES_REQUESTED',
  ClientRequestComment: 'CLIENT_REQUEST_COMMENT',
  ServiceReviewReceived: 'SERVICE_REVIEW_RECEIVED',
  ClientRequestApplication: 'CLIENT_REQUEST_APPLICATION',
} as const;

export type NotificationTypeValue =
  (typeof NotificationType)[keyof typeof NotificationType];
