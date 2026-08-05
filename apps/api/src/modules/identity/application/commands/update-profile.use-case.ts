import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';
import { TOKEN_SERVICE, type TokenService } from '../../domain/ports/token-service';
import { USER_REPOSITORY, type UserRepository } from '../../domain/ports/user.repository';

@Injectable()
export class UpdateProfileUseCase {
  public constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: {
    userId: string;
    displayName: string;
    bio: string | null;
  }): Promise<void> {
    const user = await this.users.findById(UniqueId.create(input.userId));
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    user.updateProfile({
      displayName: input.displayName,
      bio: input.bio,
      correlationId: this.tokenService.createCorrelationId(),
    });

    await this.transactions.withinTransaction(async (transaction) => {
      await this.users.save(user);
      await this.events.publish(transaction, user.pullDomainEvents());
    });
  }
}
