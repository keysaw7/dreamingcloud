import type { UniqueId } from '@dreamingcloud/shared-kernel';

export const TOKEN_REPOSITORY = Symbol('TOKEN_REPOSITORY');

export interface OneTimeToken {
  readonly id: UniqueId;
  readonly userId: UniqueId;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly usedAt: Date | null;
}

export interface TokenRepository {
  createEmailVerification(token: OneTimeToken): Promise<void>;
  createPasswordReset(token: OneTimeToken): Promise<void>;
  consumeEmailVerification(tokenHash: string): Promise<OneTimeToken | null>;
  consumePasswordReset(tokenHash: string): Promise<OneTimeToken | null>;
}
