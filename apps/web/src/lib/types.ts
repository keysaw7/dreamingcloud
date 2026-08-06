export interface ApiListMeta {
  cursor?: string | null;
  hasMore?: boolean;
}

export interface ApiListResponse<T> {
  data: readonly T[];
  meta?: ApiListMeta;
}

export interface ApiItemResponse<T> {
  data: T;
}

export interface CurrentUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string | null;
  status: string;
  role?: string;
  avatarMediaId?: string | null;
}

export interface AspirationListItem {
  id: string;
  title: string;
  slug: string;
  story: string;
  progressPercent: number;
  publishedAt: string | null;
  ownerId?: string;
  ownerUsername?: string;
  ownerDisplayName?: string;
}

export interface AspirationNeed {
  id: string;
  title: string;
  needType: string;
  status: string;
  description?: string | null;
}

export interface AspirationMilestone {
  id: string;
  title: string;
  position: number;
  description?: string | null;
}

export interface AspirationDetail {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  story: string;
  progressPercent: number;
  status?: string;
  visibility?: string;
  needs: readonly AspirationNeed[];
  milestones: readonly AspirationMilestone[];
  ownerUsername?: string;
  ownerDisplayName?: string;
}

export interface ContributionItem {
  id: string;
  status: string;
  contributionType: string;
  description: string;
  contributorId: string;
  ownerId: string;
  needId: string | null;
  conversationId: string | null;
  completedByContributorAt: string | null;
  completedByOwnerAt: string | null;
}

export interface CommentItem {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  body: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  href?: string | null;
}

export interface ConversationItem {
  id: string;
  contributionId?: string | null;
  title?: string | null;
  updatedAt?: string;
  lastMessagePreview?: string | null;
}

export interface MessageItem {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
}

export interface PublicProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  aspirations?: readonly AspirationListItem[];
}
