export type ClientRequestPublic = {
  id: string;
  title: string;
  budget: string;
  applicantsCount: number;
  createdAt: string;
};

export type ClientRequestDetailPublic = {
  id: string;
  title: string;
  detail: string | null;
  budget: string;
  applicantsCount: number;
  createdAt: string;
  ownerUserId: string;
};

export type ClientRequestCreated = {
  id: string;
  title: string;
  budget: string;
  applicantsCount: number;
  createdAt: string;
  status: string;
};

export type MyClientRequestRow = {
  id: string;
  title: string;
  budget: string;
  detail: string | null;
  status: string;
  moderationComment: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  applicantsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ClientRequestCommentPublic = {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    initials: string;
  };
};

export type ClientRequestCommentsPage = {
  comments: ClientRequestCommentPublic[];
  total: number;
};

export type AdminClientRequestQueueItem = {
  id: string;
  userId: string;
  title: string;
  detail: string | null;
  budget: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
};
