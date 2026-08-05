import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';
import {
  ASPIRATIONS_PUBLIC_API,
  type AspirationsPublicApi,
} from '../../../aspirations/aspirations.public';
import { Contribution, type ContributionType } from '../../domain/entities/contribution.entity';
import {
  CONTRIBUTION_REPOSITORY,
  type ContributionRepository,
} from '../../domain/ports/contribution.repository';

@Injectable()
export class ProposeContributionUseCase {
  public constructor(
    @Inject(CONTRIBUTION_REPOSITORY) private readonly contributions: ContributionRepository,
    @Inject(ASPIRATIONS_PUBLIC_API) private readonly aspirations: AspirationsPublicApi,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: {
    aspirationId: string;
    contributorId: string;
    needId?: string | null;
    contributionType: ContributionType;
    description: string;
  }): Promise<{ contributionId: string }> {
    const aspiration = await this.aspirations.getSummary(input.aspirationId);
    if (aspiration?.status !== 'published') {
      throw new NotFoundException('Aspiration publiée introuvable.');
    }

    if (aspiration.ownerId === input.contributorId) {
      throw new ForbiddenException('Vous ne pouvez pas contribuer à votre propre aspiration.');
    }

    const contribution = Contribution.propose({
      aspirationId: UniqueId.create(input.aspirationId),
      ownerId: UniqueId.create(aspiration.ownerId),
      needId: input.needId ? UniqueId.create(input.needId) : null,
      contributorId: UniqueId.create(input.contributorId),
      contributionType: input.contributionType,
      description: input.description,
      correlationId: UniqueId.create(),
    });

    await this.transactions.withinTransaction(async (transaction) => {
      await this.contributions.save(contribution);
      await this.events.publish(transaction, contribution.pullDomainEvents());
    });

    return { contributionId: contribution.id.value };
  }
}
