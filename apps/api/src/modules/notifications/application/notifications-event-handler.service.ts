import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { and, eq } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../platform/database/database.types';
import { aspirations, notifications, processedEvents } from '../../../platform/database/schema';

const CONSUMER = 'notifications';

@Injectable()
export class NotificationsEventHandler {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async handle(event: {
    readonly id?: string;
    readonly eventId?: string;
    readonly name: string;
    readonly actorId: string | null;
    readonly aggregateType: string;
    readonly aggregateId: string;
    readonly payload: Record<string, unknown>;
  }): Promise<void> {
    const eventId = event.eventId ?? event.id;
    if (!eventId) {
      return;
    }

    const [already] = await this.database
      .select({ eventId: processedEvents.eventId })
      .from(processedEvents)
      .where(and(eq(processedEvents.consumer, CONSUMER), eq(processedEvents.eventId, eventId)))
      .limit(1);

    if (already) {
      return;
    }

    const recipients = await this.resolveRecipients(event);
    if (recipients.length > 0) {
      await this.database.insert(notifications).values(
        recipients.map((userId) => ({
          id: UniqueId.create().value,
          userId,
          type: event.name,
          payload: {
            ...event.payload,
            aggregateType: event.aggregateType,
            aggregateId: event.aggregateId,
            actorId: event.actorId,
          },
          readAt: null,
          createdAt: new Date(),
        })),
      );
    }

    await this.database
      .insert(processedEvents)
      .values({
        consumer: CONSUMER,
        eventId,
        processedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  private async resolveRecipients(event: {
    readonly name: string;
    readonly actorId: string | null;
    readonly payload: Record<string, unknown>;
  }): Promise<string[]> {
    if (event.name.startsWith('contributions.contribution.')) {
      const aspirationId =
        typeof event.payload.aspirationId === 'string' ? event.payload.aspirationId : null;
      const contributorId =
        typeof event.payload.contributorId === 'string' ? event.payload.contributorId : null;

      if (!aspirationId) {
        return [];
      }

      const [aspiration] = await this.database
        .select({ ownerId: aspirations.ownerId })
        .from(aspirations)
        .where(eq(aspirations.id, aspirationId))
        .limit(1);

      if (!aspiration) {
        return [];
      }

      if (event.name === 'contributions.contribution.proposed.v1') {
        return this.excludeActor([aspiration.ownerId], event.actorId);
      }

      const recipients = [aspiration.ownerId];
      if (contributorId) {
        recipients.push(contributorId);
      }
      return this.excludeActor(recipients, event.actorId);
    }

    if (
      event.name === 'social.support.given.v1' ||
      event.name === 'social.comment.created.v1' ||
      event.name === 'social.save.created.v1'
    ) {
      const aspirationId =
        typeof event.payload.targetId === 'string' && event.payload.targetType === 'aspiration'
          ? event.payload.targetId
          : null;

      if (!aspirationId) {
        return [];
      }

      const [aspiration] = await this.database
        .select({ ownerId: aspirations.ownerId })
        .from(aspirations)
        .where(eq(aspirations.id, aspirationId))
        .limit(1);

      return aspiration ? this.excludeActor([aspiration.ownerId], event.actorId) : [];
    }

    if (event.name === 'social.follow.created.v1') {
      const targetId = typeof event.payload.targetId === 'string' ? event.payload.targetId : null;
      return targetId ? this.excludeActor([targetId], event.actorId) : [];
    }

    if (event.name === 'messaging.message.sent.v1') {
      const recipientIds = Array.isArray(event.payload.recipientIds)
        ? event.payload.recipientIds.filter((id): id is string => typeof id === 'string')
        : [];
      return this.excludeActor(recipientIds, event.actorId);
    }

    return [];
  }

  private excludeActor(recipients: readonly string[], actorId: string | null): string[] {
    return [...new Set(recipients)].filter((id) => id !== actorId);
  }
}
