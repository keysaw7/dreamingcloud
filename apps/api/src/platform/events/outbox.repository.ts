import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '@dreamingcloud/shared-kernel';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';

import { DATABASE_POOL, type DatabaseTransaction } from '../database/database.types';

export interface OutboxEvent {
  readonly id: string;
  readonly name: string;
  readonly occurredAt: string;
  readonly actorId: string | null;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly correlationId: string;
  readonly causationId: string | null;
  readonly payload: Record<string, unknown>;
}

interface OutboxRow extends Omit<OutboxEvent, 'occurredAt'> {
  readonly occurredAt: Date;
}

@Injectable()
export class OutboxRepository {
  public constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  public async append(transaction: DatabaseTransaction, event: DomainEvent<object>): Promise<void> {
    await transaction.execute(
      sql`INSERT INTO outbox_events (
        id, name, occurred_at, actor_id, aggregate_type, aggregate_id,
        correlation_id, causation_id, payload
      ) VALUES (
        ${event.eventId.value}, ${event.name}, ${event.occurredAt},
        ${event.actorId?.value ?? null}, ${event.aggregateType}, ${event.aggregateId.value},
        ${event.correlationId.value}, ${event.causationId?.value ?? null},
        ${JSON.stringify(event.payload)}::jsonb
      )`,
    );
  }

  public async claimBatch(limit: number): Promise<readonly OutboxEvent[]> {
    const result = await this.pool.query<OutboxRow>(
      `WITH candidates AS (
        SELECT id
        FROM outbox_events
        WHERE published_at IS NULL
          AND (claimed_at IS NULL OR claimed_at < now() - interval '5 minutes')
        ORDER BY occurred_at
        FOR UPDATE SKIP LOCKED
        LIMIT $1
      )
      UPDATE outbox_events AS outbox
      SET claimed_at = now(), attempts = attempts + 1
      FROM candidates
      WHERE outbox.id = candidates.id
      RETURNING outbox.id, outbox.name, outbox.occurred_at AS "occurredAt",
        outbox.actor_id AS "actorId", outbox.aggregate_type AS "aggregateType",
        outbox.aggregate_id AS "aggregateId", outbox.correlation_id AS "correlationId",
        outbox.causation_id AS "causationId", outbox.payload`,
      [limit],
    );

    return result.rows.map((row) => ({
      ...row,
      occurredAt: row.occurredAt.toISOString(),
    }));
  }

  public async markPublished(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE outbox_events SET published_at = now(), claimed_at = null WHERE id = $1',
      [id],
    );
  }
}
