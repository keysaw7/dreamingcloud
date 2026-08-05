import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import type { AppConfig } from '../../../../platform/config/app-config';
import { APP_CONFIG } from '../../../../platform/config/config.module';
import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';
import { User } from '../../domain/entities/user.entity';
import { PASSWORD_HASHER, type PasswordHasher } from '../../domain/ports/password-hasher';
import { MAILER, type Mailer } from '../../domain/ports/mailer';
import { TOKEN_REPOSITORY, type TokenRepository } from '../../domain/ports/token.repository';
import { TOKEN_SERVICE, type TokenService } from '../../domain/ports/token-service';
import { USER_REPOSITORY, type UserRepository } from '../../domain/ports/user.repository';

export interface RegisterUserInput {
  readonly email: string;
  readonly username: string;
  readonly displayName: string;
  readonly password: string;
}

@Injectable()
export class RegisterUserUseCase {
  public constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(TOKEN_REPOSITORY) private readonly tokens: TokenRepository,
    @Inject(MAILER) private readonly mailer: Mailer,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  public async execute(input: RegisterUserInput): Promise<{ userId: string }> {
    const existingEmail = await this.users.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictException('Un compte existe déjà avec cet e-mail.');
    }

    const existingUsername = await this.users.findByUsername(input.username);
    if (existingUsername) {
      throw new ConflictException('Ce nom d’utilisateur est déjà pris.');
    }

    const correlationId = this.tokenService.createCorrelationId();
    const user = User.create({
      email: input.email,
      username: input.username,
      displayName: input.displayName,
      correlationId,
    });
    const passwordHash = await this.passwordHasher.hash(input.password);
    const verificationToken = this.tokenService.generateOpaqueToken();

    await this.transactions.withinTransaction(async (transaction) => {
      await this.users.save(user, passwordHash);
      await this.tokens.createEmailVerification({
        id: UniqueId.create(),
        userId: user.id,
        tokenHash: this.tokenService.hashOpaqueToken(verificationToken),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        usedAt: null,
      });
      await this.events.publish(transaction, user.pullDomainEvents());
    });

    await this.mailer.send({
      to: user.email,
      subject: 'Vérifiez votre e-mail DreamingCloud',
      text: `Bonjour ${user.displayName},\n\nConfirmez votre adresse : ${this.config.APP_URL}/auth/verify-email?token=${verificationToken}\n`,
    });

    return { userId: user.id.value };
  }
}
