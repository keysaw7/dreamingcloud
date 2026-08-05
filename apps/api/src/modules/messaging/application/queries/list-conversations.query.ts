import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, lt, or, sql } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import {
  conversationParticipants,
  conversations,
  messages,
} from '../../../../platform/database/schema';
import {
  createCursorPage,
  type CursorPage,
  decodeCursor,
} from '../../../../platform/http/cursor-pagination';

export interface ConversationItem {
  readonly id: string;
  readonly kind: string;
  readonly createdAt: string;
  readonly lastMessageAt: string | null;
  readonly lastMessagePreview: string | null;
}

@Injectable()
export class ListConversationsQuery {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async execute(input: {
    userId: string;
    cursor?: string;
    limit: number;
  }): Promise<CursorPage<ConversationItem>> {
    const decoded = input.cursor ? decodeCursor(input.cursor) : null;

    const lastMessageAt = sql<Date | null>`(
      select max(m.created_at) from messages m
      where m.conversation_id = ${conversations.id}
    )`;

    const filters = [eq(conversationParticipants.userId, input.userId)];

    if (decoded?.createdAt) {
      const cursorCreatedAt = new Date(decoded.createdAt);
      filters.push(
        or(
          lt(conversations.createdAt, cursorCreatedAt),
          and(eq(conversations.createdAt, cursorCreatedAt), lt(conversations.id, decoded.id)),
        )!,
      );
    }

    const rows = await this.database
      .select({
        id: conversations.id,
        kind: conversations.kind,
        createdAt: conversations.createdAt,
        lastMessageAt,
      })
      .from(conversations)
      .innerJoin(
        conversationParticipants,
        eq(conversationParticipants.conversationId, conversations.id),
      )
      .where(and(...filters))
      .orderBy(desc(conversations.createdAt), desc(conversations.id))
      .limit(input.limit + 1);

    const items: ConversationItem[] = await Promise.all(
      rows.map(async (row) => {
        const [last] = await this.database
          .select({ body: messages.body, createdAt: messages.createdAt })
          .from(messages)
          .where(eq(messages.conversationId, row.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        return {
          id: row.id,
          kind: row.kind,
          createdAt: row.createdAt.toISOString(),
          lastMessageAt: last?.createdAt.toISOString() ?? null,
          lastMessagePreview: last?.body.slice(0, 160) ?? null,
        };
      }),
    );

    return createCursorPage(items, input.limit, (item) => ({
      id: item.id,
      createdAt: item.createdAt,
    }));
  }
}
