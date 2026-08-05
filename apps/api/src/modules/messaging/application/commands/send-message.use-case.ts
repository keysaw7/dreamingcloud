import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { and, eq, ne } from 'drizzle-orm';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import { DATABASE, type Database } from '../../../../platform/database/database.types';
import type { TransactionManager } from '../../../../platform/database/database.types';
import {
  conversationParticipants,
  conversations,
  messages,
} from '../../../../platform/database/schema';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';

@Injectable()
export class SendMessageUseCase {
  public constructor(
    @Inject(DATABASE) private readonly database: Database,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
  ) {}

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

    const recipients = await this.database
      .select({ userId: conversationParticipants.userId })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, input.conversationId),
          ne(conversationParticipants.userId, input.senderId),
        ),
      );

    const messageId = UniqueId.create();
    const createdAt = new Date();
    const correlationId = UniqueId.create();
    const actorId = UniqueId.create(input.senderId);

    await this.transactions.withinTransaction(async (transaction) => {
      await transaction.insert(messages).values({
        id: messageId.value,
        conversationId: input.conversationId,
        senderId: input.senderId,
        body: trimmed,
        createdAt,
        editedAt: null,
        deletedAt: null,
      });

      await this.events.publish(transaction, [
        {
          eventId: UniqueId.create(),
          name: 'messaging.message.sent.v1',
          occurredAt: createdAt,
          actorId,
          aggregateType: 'conversation',
          aggregateId: UniqueId.create(input.conversationId),
          correlationId,
          causationId: null,
          payload: {
            messageId: messageId.value,
            conversationId: input.conversationId,
            senderId: input.senderId,
            recipientIds: recipients.map((row) => row.userId),
          },
        },
      ]);
    });

    return { messageId: messageId.value, createdAt: createdAt.toISOString() };
  }
}
