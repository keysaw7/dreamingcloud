import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, lt, or } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import { notifications } from '../../../../platform/database/schema';
import {
  createCursorPage,
  type CursorPage,
  decodeCursor,
} from '../../../../platform/http/cursor-pagination';

export interface NotificationItem {
  readonly id: string;
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly readAt: string | null;
  readonly createdAt: string;
}

@Injectable()
export class ListNotificationsQuery {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async execute(input: {
    userId: string;
    cursor?: string;
    limit: number;
  }): Promise<CursorPage<NotificationItem>> {
    const decoded = input.cursor ? decodeCursor(input.cursor) : null;
    const filters = [eq(notifications.userId, input.userId)];

    if (decoded?.createdAt) {
      const cursorCreatedAt = new Date(decoded.createdAt);
      filters.push(
        or(
          lt(notifications.createdAt, cursorCreatedAt),
          and(eq(notifications.createdAt, cursorCreatedAt), lt(notifications.id, decoded.id)),
        )!,
      );
    }

    const rows = await this.database
      .select()
      .from(notifications)
      .where(and(...filters))
      .orderBy(desc(notifications.createdAt), desc(notifications.id))
      .limit(input.limit + 1);

    const items: NotificationItem[] = rows.map((row) => ({
      id: row.id,
      type: row.type,
      payload: row.payload as Record<string, unknown>,
      readAt: row.readAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    }));

    return createCursorPage(items, input.limit, (item) => ({
      id: item.id,
      createdAt: item.createdAt,
    }));
  }
}
