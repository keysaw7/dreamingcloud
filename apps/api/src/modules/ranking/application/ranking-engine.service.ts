import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { and, eq } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../platform/database/database.types';
import { impactScores, rankingSignals, rankingWeights } from '../../../platform/database/schema';
import { EVENT_SIGNAL_CATALOG } from '../domain/signal-catalog';

export interface RankingEventInput {
  readonly eventId: string;
  readonly name: string;
  readonly occurredAt: string | Date;
  readonly actorId: string | null;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly payload: Record<string, unknown>;
}

@Injectable()
export class RankingEngine {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async applyEvent(event: RankingEventInput): Promise<void> {
    const definition = EVENT_SIGNAL_CATALOG[event.name];
    if (!definition) {
      return;
    }

    const aggregate = definition.resolveAggregate(event);
    if (!aggregate) {
      return;
    }

    const occurredAt =
      event.occurredAt instanceof Date ? event.occurredAt : new Date(event.occurredAt);

    await this.database.insert(rankingSignals).values({
      id: UniqueId.create(event.eventId).value,
      aggregateType: aggregate.aggregateType,
      aggregateId: aggregate.aggregateId,
      signalName: definition.signalName,
      actorId: event.actorId,
      value: String(definition.value),
      occurredAt,
      metadata: { eventName: event.name },
    });

    await this.recalculateScore(aggregate.aggregateType, aggregate.aggregateId);
  }

  public async getScore(aggregateType: string, aggregateId: string): Promise<number> {
    const [row] = await this.database
      .select({ score: impactScores.score })
      .from(impactScores)
      .where(
        and(
          eq(impactScores.aggregateType, aggregateType),
          eq(impactScores.aggregateId, aggregateId),
        ),
      )
      .limit(1);

    return row ? Number(row.score) : 0;
  }

  private async recalculateScore(aggregateType: string, aggregateId: string): Promise<void> {
    const signals = await this.database
      .select({
        signalName: rankingSignals.signalName,
        value: rankingSignals.value,
      })
      .from(rankingSignals)
      .where(
        and(
          eq(rankingSignals.aggregateType, aggregateType),
          eq(rankingSignals.aggregateId, aggregateId),
        ),
      );

    const weights = await this.database
      .select({
        signalName: rankingWeights.signalName,
        weight: rankingWeights.weight,
      })
      .from(rankingWeights)
      .where(eq(rankingWeights.active, true));

    const weightBySignal = new Map<string, number>();
    for (const definition of Object.values(EVENT_SIGNAL_CATALOG)) {
      weightBySignal.set(definition.signalName, definition.defaultWeight);
    }
    for (const weight of weights) {
      weightBySignal.set(weight.signalName, Number(weight.weight));
    }

    const components: Record<string, number> = {};
    let score = 0;

    for (const signal of signals) {
      const value = Number(signal.value);
      components[signal.signalName] = (components[signal.signalName] ?? 0) + value;
      score += value * (weightBySignal.get(signal.signalName) ?? 0);
    }

    await this.database
      .insert(impactScores)
      .values({
        aggregateType,
        aggregateId,
        score: score.toFixed(6),
        components,
        calculatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [impactScores.aggregateType, impactScores.aggregateId],
        set: {
          score: score.toFixed(6),
          components,
          calculatedAt: new Date(),
        },
      });
  }
}
