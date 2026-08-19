import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, lt, or, sql } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import {
  aspirations,
  feedEntries,
  userProfiles,
  users,
} from '../../../../platform/database/schema';
import {
  createCursorPage,
  type CursorPage,
  decodeCursor,
} from '../../../../platform/http/cursor-pagination';
import type { FeedItem } from './list-discover-feed.query';

@Injectable()
export class ListFollowingFeedQuery {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async execute(input: {
    userId: string;
    cursor?: string;
    limit: number;
  }): Promise<CursorPage<FeedItem>> {
    const decoded = input.cursor ? decodeCursor(input.cursor) : null;

    const filters = [
      eq(feedEntries.userId, input.userId),
      eq(aspirations.status, 'published'),
      eq(aspirations.visibility, 'public'),
      sql`${aspirations.deletedAt} is null`,
    ];

    if (decoded?.createdAt) {
      const cursorCreatedAt = new Date(decoded.createdAt);
      filters.push(
        or(
          lt(feedEntries.createdAt, cursorCreatedAt),
          and(eq(feedEntries.createdAt, cursorCreatedAt), lt(aspirations.id, decoded.id)),
        )!,
      );
    }

    const rows = await this.database
      .select({
        id: aspirations.id,
        ownerId: aspirations.ownerId,
        ownerUsername: users.username,
        ownerDisplayName: userProfiles.displayName,
        title: aspirations.title,
        slug: aspirations.slug,
        story: aspirations.story,
        progressPercent: aspirations.progressPercent,
        publishedAt: aspirations.publishedAt,
        impactScore: feedEntries.score,
        createdAt: feedEntries.createdAt,
      })
      .from(feedEntries)
      .innerJoin(aspirations, eq(aspirations.id, feedEntries.aspirationId))
      .leftJoin(users, eq(users.id, aspirations.ownerId))
      .leftJoin(userProfiles, eq(userProfiles.userId, aspirations.ownerId))
      .where(and(...filters))
      .orderBy(desc(feedEntries.createdAt), desc(aspirations.id))
      .limit(input.limit + 1);

    const items: FeedItem[] = rows.map((row) => ({
      id: row.id,
      ownerId: row.ownerId,
      ownerUsername: row.ownerUsername ?? null,
      ownerDisplayName: row.ownerDisplayName ?? null,
      title: row.title,
      slug: row.slug,
      story: row.story,
      progressPercent: row.progressPercent,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      impactScore: Number(row.impactScore),
    }));

    const createdAtById = new Map(
      rows.map((row) => [row.id, row.createdAt.toISOString()] as const),
    );

    return createCursorPage(items, input.limit, (item) => ({
      id: item.id,
      createdAt: createdAtById.get(item.id) ?? item.publishedAt ?? new Date(0).toISOString(),
    }));
  }
}
