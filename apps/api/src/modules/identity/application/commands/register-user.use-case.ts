import { EMAIL_OTP_MAX_ATTEMPTS } from '@dreamingcloud/contracts';
import { timingSafeEqual } from 'node:crypto';
import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import type { UniqueId } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';
import { User } from '../../domain/entities/user.entity';
import {
  EMAIL_OTP_REPOSITORY,
  type EmailOtpRepository,
} from '../../domain/ports/email-otp.repository';
import { PASSWORD_HASHER, type PasswordHasher } from '../../domain/ports/password-hasher';
import { TOKEN_SERVICE, type TokenService } from '../../domain/ports/token-service';
import { USER_REPOSITORY, type UserRepository } from '../../domain/ports/user.repository';

export interface RegisterUserInput {
  readonly email: string;
  readonly username: string;
  readonly displayName: string;
  readonly password: string;
  readonly emailCode: string;
}

@Injectable()
export class RegisterUserUseCase {
  public constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(EMAIL_OTP_REPOSITORY) private readonly emailOtps: EmailOtpRepository,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: RegisterUserInput): Promise<{ userId: string }> {
    const email = input.email.toLowerCase();
    const existingEmail = await this.users.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Un compte existe déjà avec cet e-mail.');
    }

    const existingUsername = await this.users.findByUsername(input.username);
    if (existingUsername) {
      throw new ConflictException('Ce nom d’utilisateur est déjà pris.');
    }

    const challenge = await this.consumeEmailCode(email, input.emailCode);

    const correlationId = this.tokenService.createCorrelationId();
    const user = User.create({
      email,
      username: input.username,
      displayName: input.displayName,
      correlationId,
    });
    user.verifyEmail(correlationId);
    const passwordHash = await this.passwordHasher.hash(input.password);

    await this.transactions.withinTransaction(async (transaction) => {
      await this.users.save(user, passwordHash);
      await this.emailOtps.markConsumed(challenge.id);
      await this.events.publish(transaction, user.pullDomainEvents());
    });

    return { userId: user.id.value };
  }

  private async consumeEmailCode(email: string, emailCode: string): Promise<{ id: UniqueId }> {
    const challenge = await this.emailOtps.findLatestActive(email);
    if (!challenge || challenge.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Code de vérification invalide ou expiré.');
    }

    const expectedHash = this.tokenService.hashEmailOtp(email, emailCode);
    if (!otpHashesMatch(challenge.codeHash, expectedHash)) {
      const attempts = await this.emailOtps.incrementAttempts(challenge.id);
      if (attempts >= EMAIL_OTP_MAX_ATTEMPTS) {
        await this.emailOtps.markConsumed(challenge.id);
      }
      throw new BadRequestException('Code de vérification invalide ou expiré.');
    }

    return { id: challenge.id };
  }
}

function otpHashesMatch(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}
