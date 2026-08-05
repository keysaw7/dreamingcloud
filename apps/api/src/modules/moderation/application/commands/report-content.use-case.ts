import { Inject, Injectable } from '@nestjs/common';
import { UniqueId, type DomainEvent } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';
import { reports } from '../../../../platform/database/schema';

@Injectable()
export class ReportContentUseCase {
  public constructor(
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: {
    reporterId: string;
    subjectType: string;
    subjectId: string;
    reason: string;
    details?: string | null;
  }): Promise<{ reportId: string }> {
    const reportId = UniqueId.create();
    const createdAt = new Date();
    const correlationId = UniqueId.create();

    const domainEvent: DomainEvent<{
      reportId: string;
      subjectType: string;
      subjectId: string;
      reason: string;
    }> = {
      eventId: UniqueId.create(),
      name: 'moderation.content.reported.v1',
      occurredAt: createdAt,
      actorId: UniqueId.create(input.reporterId),
      aggregateType: 'report',
      aggregateId: reportId,
      correlationId,
      causationId: null,
      payload: {
        reportId: reportId.value,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        reason: input.reason,
      },
    };

    await this.transactions.withinTransaction(async (transaction) => {
      await transaction.insert(reports).values({
        id: reportId.value,
        reporterId: input.reporterId,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        reason: input.reason,
        details: input.details ?? null,
        status: 'open',
        createdAt,
        resolvedAt: null,
      });
      await this.events.publish(transaction, [domainEvent]);
    });

    return { reportId: reportId.value };
  }
}
