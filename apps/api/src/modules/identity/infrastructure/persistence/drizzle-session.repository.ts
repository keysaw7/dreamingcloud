import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { eq } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import { authSessions } from '../../../../platform/database/schema';
import type { AuthSession, SessionRepository } from '../../domain/ports/session.repository';

@Injectable()
export class DrizzleSessionRepository implements SessionRepository {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async create(session: AuthSession): Promise<void> {
    await this.database.insert(authSessions).values({
      id: session.id.value,
      userId: session.userId.value,
      tokenHash: session.tokenHash,
      familyId: session.familyId.value,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      createdAt: new Date(),
    });
  }

  public async findByTokenHash(tokenHash: string): Promise<AuthSession | null> {
    const [row] = await this.database
      .select()
      .from(authSessions)
      .where(eq(authSessions.tokenHash, tokenHash))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      id: UniqueId.create(row.id),
      userId: UniqueId.create(row.userId),
      tokenHash: row.tokenHash,
      familyId: UniqueId.create(row.familyId),
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
    };
  }

  public async revoke(sessionId: UniqueId): Promise<void> {
    await this.database
      .update(authSessions)
      .set({ revokedAt: new Date() })
      .where(eq(authSessions.id, sessionId.value));
  }

  public async revokeFamily(familyId: UniqueId): Promise<void> {
    await this.database
      .update(authSessions)
      .set({ revokedAt: new Date() })
      .where(eq(authSessions.familyId, familyId.value));
  }

  public async revokeAllForUser(userId: UniqueId): Promise<void> {
    await this.database
      .update(authSessions)
      .set({ revokedAt: new Date() })
      .where(eq(authSessions.userId, userId.value));
  }

  public async rotate(input: {
    previousSessionId: UniqueId;
    nextSession: AuthSession;
  }): Promise<void> {
    await this.revoke(input.previousSessionId);
    await this.create(input.nextSession);
  }
}
