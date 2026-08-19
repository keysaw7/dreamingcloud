import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import { emailOtpChallenges } from '../../../../platform/database/schema';
import type {
  EmailOtpChallenge,
  EmailOtpRepository,
} from '../../domain/ports/email-otp.repository';

@Injectable()
export class DrizzleEmailOtpRepository implements EmailOtpRepository {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async findLatestActive(email: string): Promise<EmailOtpChallenge | null> {
    const [row] = await this.database
      .select()
      .from(emailOtpChallenges)
      .where(and(eq(emailOtpChallenges.email, email), isNull(emailOtpChallenges.consumedAt)))
      .orderBy(desc(emailOtpChallenges.createdAt))
      .limit(1);

    return row ? this.map(row) : null;
  }

  public async create(challenge: EmailOtpChallenge): Promise<void> {
    await this.database.insert(emailOtpChallenges).values({
      id: challenge.id.value,
      email: challenge.email,
      codeHash: challenge.codeHash,
      expiresAt: challenge.expiresAt,
      consumedAt: challenge.consumedAt,
      attemptCount: challenge.attemptCount,
      createdAt: challenge.createdAt,
    });
  }

  public async invalidateActive(email: string): Promise<void> {
    await this.database
      .update(emailOtpChallenges)
      .set({ consumedAt: new Date() })
      .where(and(eq(emailOtpChallenges.email, email), isNull(emailOtpChallenges.consumedAt)));
  }

  public async markConsumed(id: UniqueId): Promise<void> {
    await this.database
      .update(emailOtpChallenges)
      .set({ consumedAt: new Date() })
      .where(eq(emailOtpChallenges.id, id.value));
  }

  public async extendExpiry(id: UniqueId, expiresAt: Date): Promise<void> {
    await this.database
      .update(emailOtpChallenges)
      .set({ expiresAt })
      .where(eq(emailOtpChallenges.id, id.value));
  }

  public async incrementAttempts(id: UniqueId): Promise<number> {
    const [row] = await this.database
      .update(emailOtpChallenges)
      .set({ attemptCount: sql`${emailOtpChallenges.attemptCount} + 1` })
      .where(eq(emailOtpChallenges.id, id.value))
      .returning({ attemptCount: emailOtpChallenges.attemptCount });

    return row?.attemptCount ?? 0;
  }

  private map(row: typeof emailOtpChallenges.$inferSelect): EmailOtpChallenge {
    return {
      id: UniqueId.create(row.id),
      email: row.email,
      codeHash: row.codeHash,
      expiresAt: row.expiresAt,
      consumedAt: row.consumedAt,
      attemptCount: row.attemptCount,
      createdAt: row.createdAt,
    };
  }
}
