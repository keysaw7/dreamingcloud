import { Injectable } from '@nestjs/common';
import type { UniqueId } from '@dreamingcloud/shared-kernel';
import { and, eq, isNull } from 'drizzle-orm';

import type { DatabaseTransaction } from '../../../../platform/database/database.types';
import { comments, follows, saves, supports } from '../../../../platform/database/schema';
import type { CreateCommentInput, SocialRepository } from '../../domain/ports/social.repository';

@Injectable()
export class DrizzleSocialRepository implements SocialRepository {
  public async giveSupport(
    aspirationId: UniqueId,
    userId: UniqueId,
    transaction: DatabaseTransaction,
  ): Promise<boolean> {
    const [row] = await transaction
      .insert(supports)
      .values({
        aspirationId: aspirationId.value,
        userId: userId.value,
      })
      .onConflictDoNothing()
      .returning();

    return Boolean(row);
  }

  public async withdrawSupport(
    aspirationId: UniqueId,
    userId: UniqueId,
    transaction: DatabaseTransaction,
  ): Promise<boolean> {
    const deleted = await transaction
      .delete(supports)
      .where(and(eq(supports.aspirationId, aspirationId.value), eq(supports.userId, userId.value)))
      .returning();

    return deleted.length > 0;
  }

  public async createComment(
    input: CreateCommentInput,
    transaction: DatabaseTransaction,
  ): Promise<void> {
    if (input.parentId) {
      const [parent] = await transaction
        .select({ id: comments.id })
        .from(comments)
        .where(
          and(
            eq(comments.id, input.parentId.value),
            eq(comments.aspirationId, input.aspirationId.value),
            isNull(comments.deletedAt),
          ),
        )
        .limit(1);

      if (!parent) {
        throw new Error('Commentaire parent introuvable.');
      }
    }

    const now = new Date();
    await transaction.insert(comments).values({
      id: input.id.value,
      aspirationId: input.aspirationId.value,
      authorId: input.authorId.value,
      parentId: input.parentId?.value ?? null,
      body: input.body,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  public async saveAspiration(
    aspirationId: UniqueId,
    userId: UniqueId,
    transaction: DatabaseTransaction,
  ): Promise<boolean> {
    const [row] = await transaction
      .insert(saves)
      .values({
        aspirationId: aspirationId.value,
        userId: userId.value,
      })
      .onConflictDoNothing()
      .returning();

    return Boolean(row);
  }

  public async unsaveAspiration(
    aspirationId: UniqueId,
    userId: UniqueId,
    transaction: DatabaseTransaction,
  ): Promise<boolean> {
    const deleted = await transaction
      .delete(saves)
      .where(and(eq(saves.aspirationId, aspirationId.value), eq(saves.userId, userId.value)))
      .returning();

    return deleted.length > 0;
  }

  public async followUser(
    followerId: UniqueId,
    followingId: UniqueId,
    transaction: DatabaseTransaction,
  ): Promise<boolean> {
    const [row] = await transaction
      .insert(follows)
      .values({
        followerId: followerId.value,
        followingId: followingId.value,
      })
      .onConflictDoNothing()
      .returning();

    return Boolean(row);
  }

  public async unfollowUser(
    followerId: UniqueId,
    followingId: UniqueId,
    transaction: DatabaseTransaction,
  ): Promise<boolean> {
    const deleted = await transaction
      .delete(follows)
      .where(
        and(eq(follows.followerId, followerId.value), eq(follows.followingId, followingId.value)),
      )
      .returning();

    return deleted.length > 0;
  }
}
