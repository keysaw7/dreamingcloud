import type { UniqueId } from '@dreamingcloud/shared-kernel';

export const EMAIL_OTP_REPOSITORY = Symbol('EMAIL_OTP_REPOSITORY');

export interface EmailOtpChallenge {
  readonly id: UniqueId;
  readonly email: string;
  readonly codeHash: string;
  readonly expiresAt: Date;
  readonly consumedAt: Date | null;
  readonly attemptCount: number;
  readonly createdAt: Date;
}

export interface EmailOtpRepository {
  findLatestActive(email: string): Promise<EmailOtpChallenge | null>;
  create(challenge: EmailOtpChallenge): Promise<void>;
  invalidateActive(email: string): Promise<void>;
  markConsumed(id: UniqueId): Promise<void>;
  incrementAttempts(id: UniqueId): Promise<number>;
}
