import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';
import { MESSAGING_PUBLIC_API, type MessagingPublicApi } from '../../../messaging/messaging.public';
import {
  CONTRIBUTION_REPOSITORY,
  type ContributionRepository,
} from '../../domain/ports/contribution.repository';
import type { ContributionStatus } from '../../domain/value-objects/contribution-status';

@Injectable()
export class TransitionContributionUseCase {
  public constructor(
    @Inject(CONTRIBUTION_REPOSITORY) private readonly contributions: ContributionRepository,
    @Inject(MESSAGING_PUBLIC_API) private readonly messaging: MessagingPublicApi,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: {
    contributionId: string;
    actorId: string;
    to: ContributionStatus;
  }): Promise<{ conversationId: string | null }> {
    const contribution = await this.contributions.findById(UniqueId.create(input.contributionId));
    if (!contribution) {
      throw new NotFoundException('Contribution introuvable.');
    }

    const actorId = UniqueId.create(input.actorId);
    const isOwner = contribution.ownerId.value === input.actorId;
    const isContributor = contribution.contributorId.value === input.actorId;
    if (!isOwner && !isContributor) {
      throw new ForbiddenException();
    }

    let conversationId = contribution.conversationId;

    if ((input.to === 'accepted' || input.to === 'in_discussion') && !conversationId) {
      conversationId = UniqueId.create(
        await this.messaging.createContributionConversation({
          contributionId: contribution.id.value,
          participantIds: [contribution.ownerId.value, contribution.contributorId.value],
        }),
      );
    }

    if (input.to === 'completed') {
      contribution.confirmCompletion(actorId, UniqueId.create());
    } else {
      contribution.transition(input.to, actorId, UniqueId.create(), conversationId ?? undefined);
    }

    await this.transactions.withinTransaction(async (transaction) => {
      await this.contributions.save(contribution);
      await this.events.publish(transaction, contribution.pullDomainEvents());
    });

    return { conversationId: contribution.conversationId?.value ?? null };
  }
}
