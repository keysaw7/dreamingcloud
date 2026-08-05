import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNull, lt, or } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import { comments, userProfiles, users } from '../../../../platform/database/schema';
import {
  createCursorPage,
  type CursorPage,
  decodeCursor,
} from '../../../../platform/http/cursor-pagination';

export interface CommentItem {
  readonly id: string;
  readonly aspirationId: string;
  readonly authorId: string;
  readonly authorUsername: string;
  readonly authorDisplayName: string;
  readonly parentId: string | null;
  readonly body: string;
  readonly createdAt: string;
}

@Injectable()
export class ListCommentsQuery {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async execute(input: {
    aspirationId: string;
    cursor?: string;
    limit: number;
  }): Promise<CursorPage<CommentItem>> {
    const decoded = input.cursor ? decodeCursor(input.cursor) : null;
    const filters = [eq(comments.aspirationId, input.aspirationId), isNull(comments.deletedAt)];

    if (decoded?.createdAt) {
      const cursorCreatedAt = new Date(decoded.createdAt);
      filters.push(
        or(
          lt(comments.createdAt, cursorCreatedAt),
          and(eq(comments.createdAt, cursorCreatedAt), lt(comments.id, decoded.id)),
        )!,
      );
    }

    const rows = await this.database
      .select({
        id: comments.id,
        aspirationId: comments.aspirationId,
        authorId: comments.authorId,
        parentId: comments.parentId,
        body: comments.body,
        createdAt: comments.createdAt,
        authorUsername: users.username,
        authorDisplayName: userProfiles.displayName,
      })
      .from(comments)
      .innerJoin(users, eq(users.id, comments.authorId))
      .innerJoin(userProfiles, eq(userProfiles.userId, comments.authorId))
      .where(and(...filters))
      .orderBy(desc(comments.createdAt), desc(comments.id))
      .limit(input.limit + 1);

    const items: CommentItem[] = rows.map((row) => ({
      id: row.id,
      aspirationId: row.aspirationId,
      authorId: row.authorId,
      authorUsername: row.authorUsername,
      authorDisplayName: row.authorDisplayName,
      parentId: row.parentId,
      body: row.body,
      createdAt: row.createdAt.toISOString(),
    }));

    return createCursorPage(items, input.limit, (item) => ({
      id: item.id,
      createdAt: item.createdAt,
    }));
  }
}
