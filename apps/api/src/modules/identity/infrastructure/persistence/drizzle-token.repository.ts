import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { and, eq, isNull } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import { emailVerificationTokens, passwordResetTokens } from '../../../../platform/database/schema';
import type { OneTimeToken, TokenRepository } from '../../domain/ports/token.repository';

@Injectable()
export class DrizzleTokenRepository implements TokenRepository {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async createEmailVerification(token: OneTimeToken): Promise<void> {
    await this.database.insert(emailVerificationTokens).values({
      id: token.id.value,
      userId: token.userId.value,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      usedAt: null,
      createdAt: new Date(),
    });
  }

  public async createPasswordReset(token: OneTimeToken): Promise<void> {
    await this.database.insert(passwordResetTokens).values({
      id: token.id.value,
      userId: token.userId.value,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      usedAt: null,
      createdAt: new Date(),
    });
  }

  public async consumeEmailVerification(tokenHash: string): Promise<OneTimeToken | null> {
    const [row] = await this.database
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenHash, tokenHash),
          isNull(emailVerificationTokens.usedAt),
        ),
      )
      .limit(1);

    if (!row || row.expiresAt.getTime() < Date.now()) {
      return null;
    }

    await this.database
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailVerificationTokens.id, row.id));

    return {
      id: UniqueId.create(row.id),
      userId: UniqueId.create(row.userId),
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      usedAt: new Date(),
    };
  }

  public async consumePasswordReset(tokenHash: string): Promise<OneTimeToken | null> {
    const [row] = await this.database
      .select()
      .from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt)))
      .limit(1);

    if (!row || row.expiresAt.getTime() < Date.now()) {
      return null;
    }

    await this.database
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, row.id));

    return {
      id: UniqueId.create(row.id),
      userId: UniqueId.create(row.userId),
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      usedAt: new Date(),
    };
  }
}
