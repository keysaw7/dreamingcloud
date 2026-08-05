import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, lt, or } from 'drizzle-orm';

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

export interface MessageItem {
  readonly id: string;
  readonly conversationId: string;
  readonly senderId: string;
  readonly body: string;
  readonly createdAt: string;
}

@Injectable()
export class ListMessagesQuery {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async execute(input: {
    conversationId: string;
    userId: string;
    cursor?: string;
    limit: number;
  }): Promise<CursorPage<MessageItem>> {
    const [conversation] = await this.database
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.id, input.conversationId))
      .limit(1);

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable.');
    }

    const [membership] = await this.database
      .select({ userId: conversationParticipants.userId })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, input.conversationId),
          eq(conversationParticipants.userId, input.userId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new ForbiddenException('Vous ne participez pas à cette conversation.');
    }

    const decoded = input.cursor ? decodeCursor(input.cursor) : null;
    const filters = [eq(messages.conversationId, input.conversationId)];

    if (decoded?.createdAt) {
      const cursorCreatedAt = new Date(decoded.createdAt);
      filters.push(
        or(
          lt(messages.createdAt, cursorCreatedAt),
          and(eq(messages.createdAt, cursorCreatedAt), lt(messages.id, decoded.id)),
        )!,
      );
    }

    const rows = await this.database
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        body: messages.body,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(and(...filters))
      .orderBy(desc(messages.createdAt), desc(messages.id))
      .limit(input.limit + 1);

    const items: MessageItem[] = rows.map((row) => ({
      id: row.id,
      conversationId: row.conversationId,
      senderId: row.senderId,
      body: row.body,
      createdAt: row.createdAt.toISOString(),
    }));

    return createCursorPage(items, input.limit, (item) => ({
      id: item.id,
      createdAt: item.createdAt,
    }));
  }
}
