import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { SOCIAL_REPOSITORY, type SocialRepository } from '../../domain/ports/social.repository';

@Injectable()
export class UnsaveAspirationUseCase {
  public constructor(
    @Inject(SOCIAL_REPOSITORY) private readonly social: SocialRepository,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: {
    readonly aspirationId: string;
    readonly userId: string;
  }): Promise<{ saved: boolean }> {
    const aspirationId = UniqueId.create(input.aspirationId);
    const userId = UniqueId.create(input.userId);

    await this.transactions.withinTransaction(async (transaction) => {
      await this.social.unsaveAspiration(aspirationId, userId, transaction);
    });

    return { saved: false };
  }
}
