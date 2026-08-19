import { EMAIL_OTP_COOLDOWN_SECONDS, EMAIL_OTP_TTL_MINUTES } from '@dreamingcloud/contracts';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { Inject, Injectable } from '@nestjs/common';

import {
  EMAIL_OTP_REPOSITORY,
  type EmailOtpRepository,
} from '../../domain/ports/email-otp.repository';
import { MAILER, type Mailer } from '../../domain/ports/mailer';
import { TOKEN_SERVICE, type TokenService } from '../../domain/ports/token-service';
import { USER_REPOSITORY, type UserRepository } from '../../domain/ports/user.repository';

@Injectable()
export class RequestEmailCodeUseCase {
  public constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(EMAIL_OTP_REPOSITORY) private readonly emailOtps: EmailOtpRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(MAILER) private readonly mailer: Mailer,
  ) {}

  public async execute(email: string): Promise<void> {
    const normalized = email.toLowerCase();
    const existing = await this.users.findByEmail(normalized);
    if (existing) {
      return;
    }

    const active = await this.emailOtps.findLatestActive(normalized);
    if (active && Date.now() - active.createdAt.getTime() < EMAIL_OTP_COOLDOWN_SECONDS * 1000) {
      return;
    }

    await this.emailOtps.invalidateActive(normalized);

    const code = this.tokenService.generateEmailOtp();
    const now = new Date();
    await this.emailOtps.create({
      id: UniqueId.create(),
      email: normalized,
      codeHash: this.tokenService.hashEmailOtp(normalized, code),
      expiresAt: new Date(now.getTime() + EMAIL_OTP_TTL_MINUTES * 60 * 1000),
      consumedAt: null,
      attemptCount: 0,
      createdAt: now,
    });

    await this.mailer.send({
      to: normalized,
      subject: 'Votre code DreamingCloud',
      text: `Votre code DreamingCloud : ${code}\nIl expire dans ${EMAIL_OTP_TTL_MINUTES} minutes.\n`,
    });
  }
}
