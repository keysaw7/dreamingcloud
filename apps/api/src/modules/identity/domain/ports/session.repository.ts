import type { UniqueId } from '@dreamingcloud/shared-kernel';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface AuthSession {
  readonly id: UniqueId;
  readonly userId: UniqueId;
  readonly tokenHash: string;
  readonly familyId: UniqueId;
  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
}

export interface SessionRepository {
  create(session: AuthSession): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<AuthSession | null>;
  revoke(sessionId: UniqueId): Promise<void>;
  revokeFamily(familyId: UniqueId): Promise<void>;
  revokeAllForUser(userId: UniqueId): Promise<void>;
  rotate(input: { previousSessionId: UniqueId; nextSession: AuthSession }): Promise<void>;
}
