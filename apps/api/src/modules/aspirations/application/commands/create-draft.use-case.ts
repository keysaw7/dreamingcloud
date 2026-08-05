import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';
import { Aspiration, type AspirationVisibility } from '../../domain/entities/aspiration.entity';
import {
  ASPIRATION_REPOSITORY,
  type AspirationRepository,
} from '../../domain/ports/aspiration.repository';

@Injectable()
export class CreateDraftUseCase {
  public constructor(
    @Inject(ASPIRATION_REPOSITORY) private readonly aspirations: AspirationRepository,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: {
    ownerId: string;
    title: string;
    story: string;
    categoryId?: string | null;
    visibility?: AspirationVisibility;
  }): Promise<{ id: string; slug: string }> {
    const correlationId = UniqueId.create();
    const aspiration = Aspiration.createDraft({
      ownerId: UniqueId.create(input.ownerId),
      title: input.title,
      story: input.story,
      categoryId: input.categoryId ? UniqueId.create(input.categoryId) : null,
      visibility: input.visibility ?? 'public',
      correlationId,
    });

    await this.transactions.withinTransaction(async (transaction) => {
      await this.aspirations.save(aspiration);
      await this.events.publish(transaction, aspiration.pullDomainEvents());
    });

    return { id: aspiration.id.value, slug: aspiration.slug };
  }
}
