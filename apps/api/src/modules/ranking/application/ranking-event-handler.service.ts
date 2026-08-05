import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../platform/database/database.types';
import { processedEvents } from '../../../platform/database/schema';
import { RankingEngine, type RankingEventInput } from './ranking-engine.service';

const CONSUMER = 'ranking';

@Injectable()
export class RankingEventHandler {
  public constructor(
    @Inject(DATABASE) private readonly database: Database,
    @Inject(RankingEngine) private readonly rankingEngine: RankingEngine,
  ) {}

  public async handle(
    event: Omit<RankingEventInput, 'eventId'> & {
      readonly eventId?: string;
      readonly id?: string;
    },
  ): Promise<void> {
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

    await this.rankingEngine.applyEvent({
      eventId,
      name: event.name,
      occurredAt: event.occurredAt,
      actorId: event.actorId,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.payload,
    });

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
