import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { conversationParticipants, conversations } from '../../../../platform/database/schema';

@Injectable()
export class CreateConversationForContributionUseCase {
  public constructor(
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: {
    contributionId: string;
    participantIds: readonly string[];
  }): Promise<string> {
    const conversationId = UniqueId.create();
    const uniqueParticipants = [...new Set(input.participantIds)];

    await this.transactions.withinTransaction(async (transaction) => {
      await transaction.insert(conversations).values({
        id: conversationId.value,
        kind: 'contribution',
        createdAt: new Date(),
      });

      await transaction.insert(conversationParticipants).values(
        uniqueParticipants.map((userId) => ({
          conversationId: conversationId.value,
          userId,
          joinedAt: new Date(),
          lastReadAt: null,
        })),
      );
    });

    return conversationId.value;
  }
}
