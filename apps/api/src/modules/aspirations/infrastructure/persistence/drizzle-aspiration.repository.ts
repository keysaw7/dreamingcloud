import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { and, desc, eq, lt, or, sql } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import {
  aspirationMilestones,
  aspirationNeeds,
  aspirationStats,
  aspirations,
} from '../../../../platform/database/schema';
import {
  Aspiration,
  type AspirationMilestone,
  type AspirationNeed,
  type AspirationVisibility,
} from '../../domain/entities/aspiration.entity';
import type { AspirationRepository } from '../../domain/ports/aspiration.repository';
import type { AspirationStatus } from '../../domain/value-objects/aspiration-status';

@Injectable()
export class DrizzleAspirationRepository implements AspirationRepository {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async findById(id: UniqueId): Promise<Aspiration | null> {
    const [row] = await this.database
      .select()
      .from(aspirations)
      .where(and(eq(aspirations.id, id.value), sql`${aspirations.deletedAt} is null`))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.hydrate(row);
  }

  public async findBySlug(slug: string): Promise<Aspiration | null> {
    const [row] = await this.database
      .select()
      .from(aspirations)
      .where(and(eq(aspirations.slug, slug), sql`${aspirations.deletedAt} is null`))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.hydrate(row);
  }

  public async save(aspiration: Aspiration): Promise<void> {
    const snapshot = aspiration.toSnapshot();

    await this.database
      .insert(aspirations)
      .values({
        id: snapshot.id.value,
        ownerId: snapshot.ownerId.value,
        categoryId: snapshot.categoryId?.value ?? null,
        title: snapshot.title,
        slug: snapshot.slug,
        story: snapshot.story,
        status: snapshot.status,
        visibility: snapshot.visibility,
        progressPercent: snapshot.progressPercent,
        publishedAt: snapshot.publishedAt,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt,
      })
      .onConflictDoUpdate({
        target: aspirations.id,
        set: {
          title: snapshot.title,
          story: snapshot.story,
          categoryId: snapshot.categoryId?.value ?? null,
          status: snapshot.status,
          visibility: snapshot.visibility,
          progressPercent: snapshot.progressPercent,
          publishedAt: snapshot.publishedAt,
          updatedAt: snapshot.updatedAt,
        },
      });

    await this.database
      .insert(aspirationStats)
      .values({ aspirationId: snapshot.id.value })
      .onConflictDoNothing();

    await this.database
      .delete(aspirationNeeds)
      .where(eq(aspirationNeeds.aspirationId, snapshot.id.value));

    if (snapshot.needs.length > 0) {
      await this.database.insert(aspirationNeeds).values(
        snapshot.needs.map((need) => ({
          id: need.id.value,
          aspirationId: snapshot.id.value,
          needType: need.needType,
          title: need.title,
          description: need.description,
          status: need.status,
          createdAt: snapshot.updatedAt,
          updatedAt: snapshot.updatedAt,
        })),
      );
    }

    await this.database
      .delete(aspirationMilestones)
      .where(eq(aspirationMilestones.aspirationId, snapshot.id.value));

    if (snapshot.milestones.length > 0) {
      await this.database.insert(aspirationMilestones).values(
        snapshot.milestones.map((milestone) => ({
          id: milestone.id.value,
          aspirationId: snapshot.id.value,
          title: milestone.title,
          description: milestone.description,
          position: milestone.position,
          completedAt: milestone.completedAt,
          createdAt: snapshot.updatedAt,
        })),
      );
    }
  }

  public async listPublished(input: {
    limit: number;
    cursorPublishedAt?: Date;
    cursorId?: string;
  }): Promise<readonly Aspiration[]> {
    const filters = [
      eq(aspirations.status, 'published'),
      eq(aspirations.visibility, 'public'),
      sql`${aspirations.deletedAt} is null`,
    ];

    if (input.cursorPublishedAt && input.cursorId) {
      filters.push(
        or(
          lt(aspirations.publishedAt, input.cursorPublishedAt),
          and(
            eq(aspirations.publishedAt, input.cursorPublishedAt),
            lt(aspirations.id, input.cursorId),
          ),
        )!,
      );
    }

    const rows = await this.database
      .select()
      .from(aspirations)
      .where(and(...filters))
      .orderBy(desc(aspirations.publishedAt), desc(aspirations.id))
      .limit(input.limit);

    return Promise.all(rows.map((row) => this.hydrate(row)));
  }

  private async hydrate(row: typeof aspirations.$inferSelect): Promise<Aspiration> {
    const needsRows = await this.database
      .select()
      .from(aspirationNeeds)
      .where(eq(aspirationNeeds.aspirationId, row.id));

    const milestoneRows = await this.database
      .select()
      .from(aspirationMilestones)
      .where(eq(aspirationMilestones.aspirationId, row.id));

    const needs: AspirationNeed[] = needsRows.map((need) => ({
      id: UniqueId.create(need.id),
      needType: need.needType as AspirationNeed['needType'],
      title: need.title,
      description: need.description,
      status: need.status as AspirationNeed['status'],
    }));

    const milestones: AspirationMilestone[] = milestoneRows.map((milestone) => ({
      id: UniqueId.create(milestone.id),
      title: milestone.title,
      description: milestone.description,
      position: milestone.position,
      completedAt: milestone.completedAt,
    }));

    return Aspiration.rehydrate({
      id: UniqueId.create(row.id),
      ownerId: UniqueId.create(row.ownerId),
      title: row.title,
      slug: row.slug,
      story: row.story,
      categoryId: row.categoryId ? UniqueId.create(row.categoryId) : null,
      status: row.status as AspirationStatus,
      visibility: row.visibility as AspirationVisibility,
      progressPercent: row.progressPercent,
      needs,
      milestones,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
