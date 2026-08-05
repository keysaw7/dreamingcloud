import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { and, eq } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import {
  conversationParticipants,
  conversations,
  messages,
} from '../../../../platform/database/schema';

@Injectable()
export class SendMessageUseCase {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async execute(input: {
    conversationId: string;
    senderId: string;
    body: string;
  }): Promise<{ messageId: string; createdAt: string }> {
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
          eq(conversationParticipants.userId, input.senderId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new ForbiddenException('Vous ne participez pas à cette conversation.');
    }

    const trimmed = input.body.trim();
    if (trimmed.length === 0) {
      throw new BadRequestException('Le message ne peut pas être vide.');
    }

    const messageId = UniqueId.create();
    const createdAt = new Date();

    await this.database.insert(messages).values({
      id: messageId.value,
      conversationId: input.conversationId,
      senderId: input.senderId,
      body: trimmed,
      createdAt,
      editedAt: null,
      deletedAt: null,
    });

    return { messageId: messageId.value, createdAt: createdAt.toISOString() };
  }
}
