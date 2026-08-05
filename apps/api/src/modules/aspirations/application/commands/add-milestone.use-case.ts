import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';
import {
  ASPIRATION_REPOSITORY,
  type AspirationRepository,
} from '../../domain/ports/aspiration.repository';

@Injectable()
export class AddMilestoneUseCase {
  public constructor(
    @Inject(ASPIRATION_REPOSITORY) private readonly aspirations: AspirationRepository,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: {
    aspirationId: string;
    actorId: string;
    title: string;
    description: string | null;
  }): Promise<{ milestoneId: string }> {
    const aspiration = await this.aspirations.findById(UniqueId.create(input.aspirationId));
    if (!aspiration) {
      throw new NotFoundException('Aspiration introuvable.');
    }

    if (aspiration.ownerId.value !== input.actorId) {
      throw new ForbiddenException();
    }

    const milestone = aspiration.addMilestone({
      title: input.title,
      description: input.description,
      correlationId: UniqueId.create(),
    });

    await this.transactions.withinTransaction(async (transaction) => {
      await this.aspirations.save(aspiration);
      await this.events.publish(transaction, aspiration.pullDomainEvents());
    });

    return { milestoneId: milestone.id.value };
  }
}
