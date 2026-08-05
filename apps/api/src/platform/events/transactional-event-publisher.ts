import { Injectable } from '@nestjs/common';
import type { DomainEvent } from '@dreamingcloud/shared-kernel';

import type { DatabaseTransaction } from '../database/database.types';
import type { EventPublisher } from './event-publisher';
import { OutboxRepository } from './outbox.repository';

@Injectable()
export class TransactionalEventPublisher implements EventPublisher {
  public constructor(private readonly outboxRepository: OutboxRepository) {}

  public async publish(
    transaction: DatabaseTransaction,
    events: readonly DomainEvent<object>[],
  ): Promise<void> {
    for (const event of events) {
      await this.outboxRepository.append(transaction, event);
    }
  }
}
