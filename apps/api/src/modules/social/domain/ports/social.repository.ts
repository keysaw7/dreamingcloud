import type { UniqueId } from '@dreamingcloud/shared-kernel';

import type { DatabaseTransaction } from '../../../../platform/database/database.types';

export const SOCIAL_REPOSITORY = Symbol('SOCIAL_REPOSITORY');

export interface CreateCommentInput {
  readonly id: UniqueId;
  readonly aspirationId: UniqueId;
  readonly authorId: UniqueId;
  readonly parentId: UniqueId | null;
  readonly body: string;
}

export interface SocialRepository {
  giveSupport(
    aspirationId: UniqueId,
    userId: UniqueId,
    transaction: DatabaseTransaction,
  ): Promise<boolean>;
  withdrawSupport(
    aspirationId: UniqueId,
    userId: UniqueId,
    transaction: DatabaseTransaction,
  ): Promise<boolean>;
  createComment(input: CreateCommentInput, transaction: DatabaseTransaction): Promise<void>;
  saveAspiration(
    aspirationId: UniqueId,
    userId: UniqueId,
    transaction: DatabaseTransaction,
  ): Promise<boolean>;
  unsaveAspiration(
    aspirationId: UniqueId,
    userId: UniqueId,
    transaction: DatabaseTransaction,
  ): Promise<boolean>;
  followUser(
    followerId: UniqueId,
    followingId: UniqueId,
    transaction: DatabaseTransaction,
  ): Promise<boolean>;
  unfollowUser(
    followerId: UniqueId,
    followingId: UniqueId,
    transaction: DatabaseTransaction,
  ): Promise<boolean>;
}
