import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey(),
    email: text('email').notNull(),
    username: text('username').notNull(),
    status: text('status').notNull().default('active'),
    role: text('role').notNull().default('user'),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    ...timestamps,
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    uniqueIndex('users_username_unique').on(table.username),
  ],
);

export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id').primaryKey(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  avatarMediaId: uuid('avatar_media_id'),
  locale: text('locale').notNull().default('fr'),
  timezone: text('timezone'),
  location: jsonb('location'),
  metadata: jsonb('metadata').notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id').primaryKey(),
  profileVisibility: text('profile_visibility').notNull().default('public'),
  notificationPreferences: jsonb('notification_preferences').notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const authCredentials = pgTable('auth_credentials', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  passwordHash: text('password_hash').notNull(),
  ...timestamps,
});

export const authSessions = pgTable(
  'auth_sessions',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id').notNull(),
    tokenHash: text('token_hash').notNull(),
    familyId: uuid('family_id').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('auth_sessions_token_hash_unique').on(table.tokenHash)],
);

export const oauthAccounts = pgTable(
  'oauth_accounts',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('oauth_accounts_provider_account_unique').on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);

export const userReputation = pgTable('user_reputation', {
  userId: uuid('user_id').primaryKey(),
  score: integer('score').notNull().default(0),
  signals: jsonb('signals').notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const emailVerificationTokens = pgTable(
  'email_verification_tokens',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id').notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('email_verification_tokens_hash_unique').on(table.tokenHash)],
);

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id').notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('password_reset_tokens_hash_unique').on(table.tokenHash)],
);

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey(),
  parentId: uuid('parent_id'),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  label: text('label').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const skills = pgTable('skills', {
  id: uuid('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  label: text('label').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const media = pgTable('media', {
  id: uuid('id').primaryKey(),
  ownerId: uuid('owner_id').notNull(),
  storageKey: text('storage_key').notNull().unique(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'bigint' }).notNull(),
  status: text('status').notNull().default('pending'),
  variants: jsonb('variants').notNull().default({}),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
});

export const aspirations = pgTable(
  'aspirations',
  {
    id: uuid('id').primaryKey(),
    ownerId: uuid('owner_id').notNull(),
    organizationId: uuid('organization_id'),
    categoryId: uuid('category_id'),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    story: text('story').notNull().default(''),
    status: text('status').notNull().default('draft'),
    visibility: text('visibility').notNull().default('public'),
    location: jsonb('location'),
    progressPercent: integer('progress_percent').notNull().default(0),
    metadata: jsonb('metadata').notNull().default({}),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    ...timestamps,
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [index('aspirations_published_idx').on(table.publishedAt)],
);

export const aspirationMilestones = pgTable('aspiration_milestones', {
  id: uuid('id').primaryKey(),
  aspirationId: uuid('aspiration_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  position: integer('position').notNull(),
  targetDate: timestamp('target_date', { mode: 'date' }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const aspirationNeeds = pgTable('aspiration_needs', {
  id: uuid('id').primaryKey(),
  aspirationId: uuid('aspiration_id').notNull(),
  skillId: uuid('skill_id'),
  needType: text('need_type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  targetAmountMinor: bigint('target_amount_minor', { mode: 'bigint' }),
  fulfilledAmountMinor: bigint('fulfilled_amount_minor', { mode: 'bigint' }).notNull().default(0n),
  currency: text('currency'),
  quantity: integer('quantity'),
  fulfilledQuantity: integer('fulfilled_quantity').notNull().default(0),
  status: text('status').notNull().default('open'),
  metadata: jsonb('metadata').notNull().default({}),
  ...timestamps,
});

export const aspirationTags = pgTable(
  'aspiration_tags',
  {
    aspirationId: uuid('aspiration_id').notNull(),
    tagId: uuid('tag_id').notNull(),
  },
  (table) => [primaryKey({ columns: [table.aspirationId, table.tagId] })],
);

export const aspirationMedia = pgTable(
  'aspiration_media',
  {
    aspirationId: uuid('aspiration_id').notNull(),
    mediaId: uuid('media_id').notNull(),
    position: integer('position').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.aspirationId, table.mediaId] })],
);

export const aspirationStats = pgTable('aspiration_stats', {
  aspirationId: uuid('aspiration_id').primaryKey(),
  supportCount: integer('support_count').notNull().default(0),
  commentCount: integer('comment_count').notNull().default(0),
  shareCount: integer('share_count').notNull().default(0),
  contributionCount: integer('contribution_count').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey(),
  ownerId: uuid('owner_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  serviceType: text('service_type').notNull(),
  availability: text('availability').notNull().default('available'),
  location: jsonb('location'),
  metadata: jsonb('metadata').notNull().default({}),
  ...timestamps,
});

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey(),
  kind: text('kind').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const conversationParticipants = pgTable(
  'conversation_participants',
  {
    conversationId: uuid('conversation_id').notNull(),
    userId: uuid('user_id').notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
    lastReadAt: timestamp('last_read_at', { withTimezone: true }),
  },
  (table) => [primaryKey({ columns: [table.conversationId, table.userId] })],
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey(),
    conversationId: uuid('conversation_id').notNull(),
    senderId: uuid('sender_id').notNull(),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    editedAt: timestamp('edited_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [index('messages_conversation_idx').on(table.conversationId, table.createdAt)],
);

export const contributions = pgTable(
  'contributions',
  {
    id: uuid('id').primaryKey(),
    aspirationId: uuid('aspiration_id').notNull(),
    needId: uuid('need_id'),
    serviceId: uuid('service_id'),
    contributorId: uuid('contributor_id').notNull(),
    status: text('status').notNull().default('proposed'),
    contributionType: text('contribution_type').notNull(),
    description: text('description').notNull(),
    conversationId: uuid('conversation_id'),
    completedByContributorAt: timestamp('completed_by_contributor_at', { withTimezone: true }),
    completedByOwnerAt: timestamp('completed_by_owner_at', { withTimezone: true }),
    metadata: jsonb('metadata').notNull().default({}),
    ...timestamps,
  },
  (table) => [index('contributions_aspiration_idx').on(table.aspirationId, table.status)],
);

export const contributionStateHistory = pgTable('contribution_state_history', {
  id: uuid('id').primaryKey(),
  contributionId: uuid('contribution_id').notNull(),
  fromStatus: text('from_status'),
  toStatus: text('to_status').notNull(),
  actorId: uuid('actor_id'),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const contributionAttachments = pgTable(
  'contribution_attachments',
  {
    contributionId: uuid('contribution_id').notNull(),
    mediaId: uuid('media_id').notNull(),
  },
  (table) => [primaryKey({ columns: [table.contributionId, table.mediaId] })],
);

export const supports = pgTable(
  'supports',
  {
    aspirationId: uuid('aspiration_id').notNull(),
    userId: uuid('user_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.aspirationId, table.userId] })],
);

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey(),
  aspirationId: uuid('aspiration_id').notNull(),
  authorId: uuid('author_id').notNull(),
  parentId: uuid('parent_id'),
  body: text('body').notNull(),
  ...timestamps,
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const shares = pgTable('shares', {
  id: uuid('id').primaryKey(),
  aspirationId: uuid('aspiration_id').notNull(),
  userId: uuid('user_id').notNull(),
  channel: text('channel').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const saves = pgTable(
  'saves',
  {
    aspirationId: uuid('aspiration_id').notNull(),
    userId: uuid('user_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.aspirationId, table.userId] })],
);

export const follows = pgTable(
  'follows',
  {
    followerId: uuid('follower_id').notNull(),
    followingId: uuid('following_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.followerId, table.followingId] })],
);

export const rankingWeights = pgTable(
  'ranking_weights',
  {
    id: uuid('id').primaryKey(),
    signalName: text('signal_name').notNull(),
    weight: numeric('weight').notNull(),
    version: integer('version').notNull(),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('ranking_weights_signal_version_unique').on(table.signalName, table.version),
  ],
);

export const rankingSignals = pgTable('ranking_signals', {
  id: uuid('id').notNull(),
  aggregateType: text('aggregate_type').notNull(),
  aggregateId: uuid('aggregate_id').notNull(),
  signalName: text('signal_name').notNull(),
  actorId: uuid('actor_id'),
  value: numeric('value').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  metadata: jsonb('metadata').notNull().default({}),
});

export const impactScores = pgTable(
  'impact_scores',
  {
    aggregateType: text('aggregate_type').notNull(),
    aggregateId: uuid('aggregate_id').notNull(),
    score: numeric('score').notNull().default('0'),
    components: jsonb('components').notNull().default({}),
    calculatedAt: timestamp('calculated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.aggregateType, table.aggregateId] })],
);

export const feedEntries = pgTable(
  'feed_entries',
  {
    userId: uuid('user_id').notNull(),
    aspirationId: uuid('aspiration_id').notNull(),
    score: numeric('score').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.aspirationId] })],
);

export const feedCursors = pgTable('feed_cursors', {
  userId: uuid('user_id').primaryKey(),
  lastReadAt: timestamp('last_read_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  type: text('type').notNull(),
  payload: jsonb('payload').notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey(),
  reporterId: uuid('reporter_id').notNull(),
  subjectType: text('subject_type').notNull(),
  subjectId: uuid('subject_id').notNull(),
  reason: text('reason').notNull(),
  details: text('details'),
  status: text('status').notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});

export const moderationActions = pgTable('moderation_actions', {
  id: uuid('id').primaryKey(),
  reportId: uuid('report_id'),
  moderatorId: uuid('moderator_id'),
  subjectType: text('subject_type').notNull(),
  subjectId: uuid('subject_id').notNull(),
  action: text('action').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userSanctions = pgTable('user_sanctions', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  actionId: uuid('action_id'),
  type: text('type').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const outboxEvents = pgTable(
  'outbox_events',
  {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    actorId: uuid('actor_id'),
    aggregateType: text('aggregate_type').notNull(),
    aggregateId: uuid('aggregate_id').notNull(),
    correlationId: uuid('correlation_id').notNull(),
    causationId: uuid('causation_id'),
    payload: jsonb('payload').notNull(),
    attempts: integer('attempts').notNull().default(0),
    claimedAt: timestamp('claimed_at', { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('outbox_events_unpublished_idx').on(table.occurredAt)],
);

export const processedEvents = pgTable(
  'processed_events',
  {
    consumer: text('consumer').notNull(),
    eventId: uuid('event_id').notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.consumer, table.eventId] })],
);

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey(),
  actorId: uuid('actor_id'),
  action: text('action').notNull(),
  subjectType: text('subject_type').notNull(),
  subjectId: uuid('subject_id').notNull(),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const schema = {
  users,
  userProfiles,
  userSettings,
  authCredentials,
  authSessions,
  oauthAccounts,
  userReputation,
  emailVerificationTokens,
  passwordResetTokens,
  categories,
  tags,
  skills,
  media,
  aspirations,
  aspirationMilestones,
  aspirationNeeds,
  aspirationTags,
  aspirationMedia,
  aspirationStats,
  services,
  conversations,
  conversationParticipants,
  messages,
  contributions,
  contributionStateHistory,
  contributionAttachments,
  supports,
  comments,
  shares,
  saves,
  follows,
  rankingWeights,
  rankingSignals,
  impactScores,
  feedEntries,
  feedCursors,
  notifications,
  reports,
  moderationActions,
  userSanctions,
  outboxEvents,
  processedEvents,
  auditLog,
};
