import { EMAIL_OTP_VERIFIED_TTL_MINUTES } from '@dreamingcloud/contracts';
import { Inject, Injectable } from '@nestjs/common';

import {
  EMAIL_OTP_REPOSITORY,
  type EmailOtpRepository,
} from '../../domain/ports/email-otp.repository';
import { EmailOtpVerifier } from '../email-otp-verifier';

@Injectable()
export class VerifyEmailCodeUseCase {
  public constructor(
    private readonly emailOtpVerifier: EmailOtpVerifier,
    @Inject(EMAIL_OTP_REPOSITORY) private readonly emailOtps: EmailOtpRepository,
  ) {}

  public async execute(email: string, emailCode: string): Promise<void> {
    const challenge = await this.emailOtpVerifier.assertValid(email.toLowerCase(), emailCode);
    await this.emailOtps.extendExpiry(
      challenge.id,
      new Date(Date.now() + EMAIL_OTP_VERIFIED_TTL_MINUTES * 60 * 1000),
    );
  }
}
