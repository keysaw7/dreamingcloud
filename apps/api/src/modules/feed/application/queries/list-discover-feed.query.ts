import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import {
  aspirations,
  impactScores,
  userProfiles,
  users,
} from '../../../../platform/database/schema';
import {
  createCursorPage,
  type CursorPage,
  decodeCursor,
} from '../../../../platform/http/cursor-pagination';

export interface FeedItem {
  readonly id: string;
  readonly ownerId: string;
  readonly ownerUsername: string | null;
  readonly ownerDisplayName: string | null;
  readonly title: string;
  readonly slug: string;
  readonly story: string;
  readonly progressPercent: number;
  readonly publishedAt: string | null;
  readonly impactScore: number;
}

@Injectable()
export class ListDiscoverFeedQuery {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async execute(input: { cursor?: string; limit: number }): Promise<CursorPage<FeedItem>> {
    const decoded = input.cursor ? decodeCursor(input.cursor) : null;
    const scoreExpr = sql<number>`coalesce(${impactScores.score}::numeric, 0)`;

    const filters = [
      eq(aspirations.status, 'published'),
      eq(aspirations.visibility, 'public'),
      sql`${aspirations.deletedAt} is null`,
    ];

    if (decoded) {
      const cursorScore = decoded.score ?? 0;
      const cursorPublishedAt = new Date(decoded.createdAt);
      filters.push(
        sql`(
          ${scoreExpr} < ${cursorScore}
          OR (
            ${scoreExpr} = ${cursorScore}
            AND ${aspirations.publishedAt} < ${cursorPublishedAt}
          )
          OR (
            ${scoreExpr} = ${cursorScore}
            AND ${aspirations.publishedAt} = ${cursorPublishedAt}
            AND ${aspirations.id} < ${decoded.id}
          )
        )`,
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
        impactScore: scoreExpr,
      })
      .from(aspirations)
      .leftJoin(
        impactScores,
        and(
          eq(impactScores.aggregateType, 'aspiration'),
          eq(impactScores.aggregateId, aspirations.id),
        ),
      )
      .leftJoin(users, eq(users.id, aspirations.ownerId))
      .leftJoin(userProfiles, eq(userProfiles.userId, aspirations.ownerId))
      .where(and(...filters))
      .orderBy(desc(scoreExpr), desc(aspirations.publishedAt), desc(aspirations.id))
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

    return createCursorPage(items, input.limit, (item) => ({
      id: item.id,
      createdAt: item.publishedAt ?? new Date(0).toISOString(),
      score: item.impactScore,
    }));
  }
}
