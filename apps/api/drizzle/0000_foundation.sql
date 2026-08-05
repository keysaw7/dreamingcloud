CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  username text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE user_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  bio text,
  avatar_media_id uuid,
  locale text NOT NULL DEFAULT 'fr',
  timezone text,
  location jsonb,
  metadata jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  profile_visibility text NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
  notification_preferences jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE auth_credentials (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE auth_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  family_id uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE oauth_accounts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_account_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_account_id)
);

CREATE TABLE user_reputation (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  signals jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id uuid PRIMARY KEY,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tags (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE skills (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_skills (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level text CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE media (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_key text NOT NULL UNIQUE,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected')),
  variants jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_avatar_media_fk
  FOREIGN KEY (avatar_media_id) REFERENCES media(id) ON DELETE SET NULL;

CREATE TABLE aspirations (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id uuid,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  story text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed', 'archived')),
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
  location jsonb,
  target_date date,
  progress_percent smallint NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  search_document tsvector,
  metadata jsonb NOT NULL DEFAULT '{}',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE aspiration_milestones (
  id uuid PRIMARY KEY,
  aspiration_id uuid NOT NULL REFERENCES aspirations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  position integer NOT NULL,
  target_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (aspiration_id, position)
);

CREATE TABLE aspiration_needs (
  id uuid PRIMARY KEY,
  aspiration_id uuid NOT NULL REFERENCES aspirations(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE SET NULL,
  need_type text NOT NULL CHECK (need_type IN ('money', 'skill', 'material', 'time', 'contact', 'other')),
  title text NOT NULL,
  description text,
  target_amount_minor bigint CHECK (target_amount_minor >= 0),
  fulfilled_amount_minor bigint NOT NULL DEFAULT 0 CHECK (fulfilled_amount_minor >= 0),
  currency char(3),
  quantity integer CHECK (quantity > 0),
  fulfilled_quantity integer NOT NULL DEFAULT 0 CHECK (fulfilled_quantity >= 0),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fulfilled', 'cancelled')),
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE aspiration_tags (
  aspiration_id uuid NOT NULL REFERENCES aspirations(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (aspiration_id, tag_id)
);

CREATE TABLE aspiration_media (
  aspiration_id uuid NOT NULL REFERENCES aspirations(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (aspiration_id, media_id)
);

CREATE TABLE aspiration_stats (
  aspiration_id uuid PRIMARY KEY REFERENCES aspirations(id) ON DELETE CASCADE,
  support_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  share_count integer NOT NULL DEFAULT 0,
  contribution_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE services (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  service_type text NOT NULL CHECK (service_type IN ('skill', 'material', 'time', 'transport', 'hosting', 'other')),
  availability text NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'paused', 'archived')),
  location jsonb,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE service_skills (
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, skill_id)
);

CREATE TABLE service_media (
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, media_id)
);

CREATE TABLE service_requests (
  id uuid PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  aspiration_id uuid NOT NULL REFERENCES aspirations(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'matched', 'declined', 'cancelled')),
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE conversations (
  id uuid PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('contribution', 'direct')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contributions (
  id uuid PRIMARY KEY,
  aspiration_id uuid NOT NULL REFERENCES aspirations(id) ON DELETE CASCADE,
  need_id uuid REFERENCES aspiration_needs(id) ON DELETE SET NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  contributor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'in_discussion', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled', 'disputed')),
  contribution_type text NOT NULL CHECK (contribution_type IN ('money', 'material', 'time', 'skill', 'advice', 'contact', 'mentorship', 'partnership', 'job', 'hosting', 'service', 'other')),
  description text NOT NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  completed_by_contributor_at timestamptz,
  completed_by_owner_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contribution_messages (
  id uuid PRIMARY KEY,
  contribution_id uuid NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz
);

CREATE TABLE contribution_attachments (
  contribution_id uuid NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  PRIMARY KEY (contribution_id, media_id)
);

CREATE TABLE contribution_state_history (
  id uuid PRIMARY KEY,
  contribution_id uuid NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE supports (
  aspiration_id uuid NOT NULL REFERENCES aspirations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (aspiration_id, user_id)
);

CREATE TABLE comments (
  id uuid PRIMARY KEY,
  aspiration_id uuid NOT NULL REFERENCES aspirations(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE comment_reactions (
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, user_id, reaction)
);

CREATE TABLE shares (
  id uuid PRIMARY KEY,
  aspiration_id uuid NOT NULL REFERENCES aspirations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE saves (
  aspiration_id uuid NOT NULL REFERENCES aspirations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (aspiration_id, user_id)
);

CREATE TABLE follows (
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE TABLE stripe_accounts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stripe_account_id text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'restricted', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wallets (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency char(3) NOT NULL,
  available_amount_minor bigint NOT NULL DEFAULT 0,
  pending_amount_minor bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, currency)
);

CREATE TABLE payment_intents (
  id uuid PRIMARY KEY,
  payer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  contribution_id uuid REFERENCES contributions(id) ON DELETE SET NULL,
  reference_type text NOT NULL,
  reference_id uuid NOT NULL,
  provider text NOT NULL DEFAULT 'stripe',
  provider_payment_intent_id text UNIQUE,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency char(3) NOT NULL,
  platform_fee_minor bigint NOT NULL DEFAULT 0 CHECK (platform_fee_minor >= 0),
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled')),
  idempotency_key text NOT NULL UNIQUE,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ledger_entries (
  id uuid PRIMARY KEY,
  transaction_id uuid NOT NULL,
  account_type text NOT NULL,
  account_id uuid NOT NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('debit', 'credit')),
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency char(3) NOT NULL,
  reference_type text NOT NULL,
  reference_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wallet_transactions (
  id uuid PRIMARY KEY,
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  ledger_transaction_id uuid NOT NULL,
  amount_minor bigint NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'hold', 'release')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payouts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  stripe_payout_id text UNIQUE,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency char(3) NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

CREATE TABLE refunds (
  id uuid PRIMARY KEY,
  payment_intent_id uuid NOT NULL REFERENCES payment_intents(id) ON DELETE RESTRICT,
  stripe_refund_id text UNIQUE,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  reason text,
  status text NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE webhook_events (
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  payload jsonb NOT NULL,
  PRIMARY KEY (provider, provider_event_id)
);

CREATE TABLE ranking_weights (
  id uuid PRIMARY KEY,
  signal_name text NOT NULL,
  weight numeric(12, 6) NOT NULL,
  version integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (signal_name, version)
);

CREATE TABLE ranking_signals (
  id uuid NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  signal_name text NOT NULL,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  value numeric(18, 6) NOT NULL,
  occurred_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

CREATE TABLE ranking_signals_2026_08 PARTITION OF ranking_signals
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE impact_scores (
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  score numeric(18, 6) NOT NULL DEFAULT 0,
  components jsonb NOT NULL DEFAULT '{}',
  calculated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (aggregate_type, aggregate_id)
);

CREATE TABLE feed_entries (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  aspiration_id uuid NOT NULL REFERENCES aspirations(id) ON DELETE CASCADE,
  score numeric(18, 6) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, aspiration_id)
);

CREATE TABLE feed_cursors (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  last_read_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  channels jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE device_tokens (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id uuid PRIMARY KEY,
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE moderation_actions (
  id uuid PRIMARY KEY,
  report_id uuid REFERENCES reports(id) ON DELETE SET NULL,
  moderator_id uuid REFERENCES users(id) ON DELETE SET NULL,
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  action text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_sanctions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_id uuid REFERENCES moderation_actions(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('warning', 'restriction', 'suspension', 'ban')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE outbox_events (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  occurred_at timestamptz NOT NULL,
  actor_id uuid,
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  correlation_id uuid NOT NULL,
  causation_id uuid,
  payload jsonb NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  claimed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE processed_events (
  consumer text NOT NULL,
  event_id uuid NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (consumer, event_id)
);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX aspirations_published_idx ON aspirations (published_at DESC)
  WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX aspirations_search_idx ON aspirations USING gin (search_document);
CREATE INDEX aspirations_title_trgm_idx ON aspirations USING gin (title gin_trgm_ops);
CREATE INDEX supports_aspiration_idx ON supports (aspiration_id, created_at DESC);
CREATE INDEX comments_aspiration_idx ON comments (aspiration_id, created_at DESC);
CREATE INDEX contributions_aspiration_idx ON contributions (aspiration_id, status, created_at DESC);
CREATE INDEX contribution_messages_contribution_idx ON contribution_messages (contribution_id, created_at);
CREATE INDEX payment_intents_reference_idx ON payment_intents (reference_type, reference_id);
CREATE INDEX ledger_entries_account_idx ON ledger_entries (account_type, account_id, created_at);
CREATE INDEX ranking_signals_aggregate_idx ON ranking_signals (aggregate_id, occurred_at);
CREATE INDEX impact_scores_score_idx ON impact_scores (score DESC);
CREATE INDEX feed_entries_user_score_idx ON feed_entries (user_id, score DESC, created_at DESC);
CREATE INDEX notifications_user_idx ON notifications (user_id, created_at DESC);
CREATE INDEX outbox_events_unpublished_idx ON outbox_events (occurred_at)
  WHERE published_at IS NULL;
