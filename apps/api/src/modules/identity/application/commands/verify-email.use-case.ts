import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';
import { TOKEN_REPOSITORY, type TokenRepository } from '../../domain/ports/token.repository';
import { TOKEN_SERVICE, type TokenService } from '../../domain/ports/token-service';
import { USER_REPOSITORY, type UserRepository } from '../../domain/ports/user.repository';

@Injectable()
export class VerifyEmailUseCase {
  public constructor(
    @Inject(TOKEN_REPOSITORY) private readonly tokens: TokenRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(token: string): Promise<void> {
    const consumed = await this.tokens.consumeEmailVerification(
      this.tokenService.hashOpaqueToken(token),
    );

    if (!consumed) {
      throw new BadRequestException('Jeton de vérification invalide ou expiré.');
    }

    const user = await this.users.findById(consumed.userId);
    if (!user) {
      throw new BadRequestException('Utilisateur introuvable.');
    }

    const correlationId = this.tokenService.createCorrelationId();
    user.verifyEmail(correlationId);

    await this.transactions.withinTransaction(async (transaction) => {
      await this.users.save(user);
      await this.events.publish(transaction, user.pullDomainEvents());
    });
  }
}
