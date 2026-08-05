import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { eq } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import { contributionStateHistory, contributions } from '../../../../platform/database/schema';
import { Contribution, type ContributionType } from '../../domain/entities/contribution.entity';
import type { ContributionRepository } from '../../domain/ports/contribution.repository';
import type { ContributionStatus } from '../../domain/value-objects/contribution-status';

@Injectable()
export class DrizzleContributionRepository implements ContributionRepository {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async findById(id: UniqueId): Promise<Contribution | null> {
    const [row] = await this.database
      .select()
      .from(contributions)
      .where(eq(contributions.id, id.value))
      .limit(1);

    if (!row) {
      return null;
    }

    // ownerId is resolved via aspiration in use cases; stored in metadata for MVP hydration.
    const metadata = (row.metadata ?? {}) as { ownerId?: string };
    return Contribution.rehydrate({
      id: UniqueId.create(row.id),
      aspirationId: UniqueId.create(row.aspirationId),
      needId: row.needId ? UniqueId.create(row.needId) : null,
      contributorId: UniqueId.create(row.contributorId),
      ownerId: UniqueId.create(metadata.ownerId ?? row.contributorId),
      status: row.status as ContributionStatus,
      contributionType: row.contributionType as ContributionType,
      description: row.description,
      conversationId: row.conversationId ? UniqueId.create(row.conversationId) : null,
      completedByContributorAt: row.completedByContributorAt,
      completedByOwnerAt: row.completedByOwnerAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  public async save(contribution: Contribution): Promise<void> {
    const snapshot = contribution.toSnapshot();

    await this.database
      .insert(contributions)
      .values({
        id: snapshot.id.value,
        aspirationId: snapshot.aspirationId.value,
        needId: snapshot.needId?.value ?? null,
        contributorId: snapshot.contributorId.value,
        status: snapshot.status,
        contributionType: snapshot.contributionType,
        description: snapshot.description,
        conversationId: snapshot.conversationId?.value ?? null,
        completedByContributorAt: snapshot.completedByContributorAt,
        completedByOwnerAt: snapshot.completedByOwnerAt,
        metadata: { ownerId: snapshot.ownerId.value },
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt,
      })
      .onConflictDoUpdate({
        target: contributions.id,
        set: {
          status: snapshot.status,
          conversationId: snapshot.conversationId?.value ?? null,
          completedByContributorAt: snapshot.completedByContributorAt,
          completedByOwnerAt: snapshot.completedByOwnerAt,
          metadata: { ownerId: snapshot.ownerId.value },
          updatedAt: snapshot.updatedAt,
        },
      });

    await this.database.insert(contributionStateHistory).values({
      id: UniqueId.create().value,
      contributionId: snapshot.id.value,
      fromStatus: null,
      toStatus: snapshot.status,
      actorId: snapshot.contributorId.value,
      createdAt: snapshot.updatedAt,
    });
  }

  public async listByAspiration(aspirationId: UniqueId): Promise<readonly Contribution[]> {
    const rows = await this.database
      .select()
      .from(contributions)
      .where(eq(contributions.aspirationId, aspirationId.value));

    return Promise.all(rows.map(async (row) => this.findById(UniqueId.create(row.id)))).then(
      (items) => items.filter((item): item is Contribution => item !== null),
    );
  }
}
