import { EMAIL_OTP_MAX_ATTEMPTS } from '@dreamingcloud/contracts';
import { timingSafeEqual } from 'node:crypto';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
  EMAIL_OTP_REPOSITORY,
  type EmailOtpChallenge,
  type EmailOtpRepository,
} from '../domain/ports/email-otp.repository';
import { TOKEN_SERVICE, type TokenService } from '../domain/ports/token-service';

const INVALID_EMAIL_CODE = 'Code de vérification invalide ou expiré.';

@Injectable()
export class EmailOtpVerifier {
  public constructor(
    @Inject(EMAIL_OTP_REPOSITORY) private readonly emailOtps: EmailOtpRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) {}

  public async assertValid(email: string, emailCode: string): Promise<EmailOtpChallenge> {
    const challenge = await this.emailOtps.findLatestActive(email);
    if (!challenge || challenge.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException(INVALID_EMAIL_CODE);
    }

    const expectedHash = this.tokenService.hashEmailOtp(email, emailCode);
    if (!otpHashesMatch(challenge.codeHash, expectedHash)) {
      const attempts = await this.emailOtps.incrementAttempts(challenge.id);
      if (attempts >= EMAIL_OTP_MAX_ATTEMPTS) {
        await this.emailOtps.markConsumed(challenge.id);
      }
      throw new BadRequestException(INVALID_EMAIL_CODE);
    }

    return challenge;
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
