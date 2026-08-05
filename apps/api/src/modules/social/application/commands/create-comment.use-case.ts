import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';
import { createCommentCreatedEvent } from '../../domain/events/social.events';
import { SOCIAL_REPOSITORY, type SocialRepository } from '../../domain/ports/social.repository';

@Injectable()
export class CreateCommentUseCase {
  public constructor(
    @Inject(SOCIAL_REPOSITORY) private readonly social: SocialRepository,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: {
    readonly aspirationId: string;
    readonly authorId: string;
    readonly body: string;
    readonly parentId?: string | null;
  }): Promise<{ commentId: string }> {
    const body = input.body.trim();
    if (body.length === 0) {
      throw new BadRequestException('Le commentaire ne peut pas être vide.');
    }

    const aspirationId = UniqueId.create(input.aspirationId);
    const authorId = UniqueId.create(input.authorId);
    const commentId = UniqueId.create();
    const parentId = input.parentId ? UniqueId.create(input.parentId) : null;
    const correlationId = UniqueId.create();

    try {
      await this.transactions.withinTransaction(async (transaction) => {
        await this.social.createComment(
          {
            id: commentId,
            aspirationId,
            authorId,
            parentId,
            body,
          },
          transaction,
        );
        await this.events.publish(transaction, [
          createCommentCreatedEvent(aspirationId, authorId, commentId, correlationId),
        ]);
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('parent')) {
        throw new BadRequestException('Commentaire parent introuvable.');
      }
      throw error;
    }

    return { commentId: commentId.value };
  }
}
