import { Inject, Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import {
  aspirations,
  feedEntries,
  follows,
  impactScores,
  processedEvents,
} from '../../../../platform/database/schema';

const CONSUMER = 'feed-projection';

@Injectable()
export class ProjectPublishedAspirationService {
  private readonly logger = new Logger(ProjectPublishedAspirationService.name);

  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async handle(event: {
    readonly id?: string;
    readonly eventId?: string;
    readonly name: string;
    readonly payload: Record<string, unknown>;
  }): Promise<void> {
    if (event.name !== 'aspirations.aspiration.published.v1') {
      return;
    }

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

    const aspirationId =
      typeof event.payload.aspirationId === 'string' ? event.payload.aspirationId : null;
    const ownerId = typeof event.payload.ownerId === 'string' ? event.payload.ownerId : null;

    if (!aspirationId || !ownerId) {
      this.logger.warn('aspiration.published missing aspirationId/ownerId');
      return;
    }

    const [scoreRow] = await this.database
      .select({ score: impactScores.score })
      .from(impactScores)
      .where(
        and(
          eq(impactScores.aggregateType, 'aspiration'),
          eq(impactScores.aggregateId, aspirationId),
        ),
      )
      .limit(1);

    const [aspiration] = await this.database
      .select({ id: aspirations.id, visibility: aspirations.visibility })
      .from(aspirations)
      .where(eq(aspirations.id, aspirationId))
      .limit(1);

    if (aspiration?.visibility !== 'public') {
      await this.database
        .insert(processedEvents)
        .values({
          consumer: CONSUMER,
          eventId,
          processedAt: new Date(),
        })
        .onConflictDoNothing();
      return;
    }

    const followers = await this.database
      .select({ followerId: follows.followerId })
      .from(follows)
      .where(eq(follows.followingId, ownerId));

    if (followers.length > 0) {
      const score = scoreRow ? scoreRow.score : '0';
      await this.database
        .insert(feedEntries)
        .values(
          followers.map((follower) => ({
            userId: follower.followerId,
            aspirationId,
            score,
            createdAt: new Date(),
          })),
        )
        .onConflictDoNothing();
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
}
