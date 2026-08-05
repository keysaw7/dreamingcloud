import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';
import { createSaveCreatedEvent } from '../../domain/events/social.events';
import { SOCIAL_REPOSITORY, type SocialRepository } from '../../domain/ports/social.repository';

@Injectable()
export class SaveAspirationUseCase {
  public constructor(
    @Inject(SOCIAL_REPOSITORY) private readonly social: SocialRepository,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: {
    readonly aspirationId: string;
    readonly userId: string;
  }): Promise<{ saved: boolean }> {
    const aspirationId = UniqueId.create(input.aspirationId);
    const userId = UniqueId.create(input.userId);
    const correlationId = UniqueId.create();

    await this.transactions.withinTransaction(async (transaction) => {
      const inserted = await this.social.saveAspiration(aspirationId, userId, transaction);
      if (inserted) {
        await this.events.publish(transaction, [
          createSaveCreatedEvent(aspirationId, userId, correlationId),
        ]);
      }
    });

    return { saved: true };
  }
}
