import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';
import { createFollowRemovedEvent } from '../../domain/events/social.events';
import { SOCIAL_REPOSITORY, type SocialRepository } from '../../domain/ports/social.repository';

@Injectable()
export class UnfollowUserUseCase {
  public constructor(
    @Inject(SOCIAL_REPOSITORY) private readonly social: SocialRepository,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: {
    readonly followerId: string;
    readonly followingId: string;
  }): Promise<{ following: boolean }> {
    if (input.followerId === input.followingId) {
      throw new BadRequestException('Action invalide.');
    }

    const followerId = UniqueId.create(input.followerId);
    const followingId = UniqueId.create(input.followingId);
    const correlationId = UniqueId.create();

    await this.transactions.withinTransaction(async (transaction) => {
      const removed = await this.social.unfollowUser(followerId, followingId, transaction);
      if (removed) {
        await this.events.publish(transaction, [
          createFollowRemovedEvent(followingId, followerId, correlationId),
        ]);
      }
    });

    return { following: false };
  }
}
