export type ModerationReportReason =
  | "fraud"
  | "inappropriate_content"
  | "false_information"
  | "spam"
  | "other";

export type ModerationTargetType =
  | "service"
  | "client_request"
  | "client_request_comment"
  | "user";

export type ModerationReviewStatus = "pending" | "dismissed" | "actioned";

export type AdminModerationReportItem = {
  id: string;
  targetType: ModerationTargetType;
  targetId: string;
  parentClientRequestId: string | null;
  subjectProfileId: string | null;
  reason: string;
  details: string | null;
  reviewStatus: ModerationReviewStatus;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    email: string;
    fullName: string | null;
  };
  targetSummary: string;
};
