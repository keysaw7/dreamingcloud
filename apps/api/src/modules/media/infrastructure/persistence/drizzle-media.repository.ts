import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { eq } from 'drizzle-orm';

import {
  DATABASE,
  type Database,
  type DatabaseTransaction,
} from '../../../../platform/database/database.types';
import { media as mediaTable } from '../../../../platform/database/schema';
import { Media, type MediaStatus } from '../../domain/entities/media.entity';
import type { MediaRepository } from '../../domain/ports/media.repository';

@Injectable()
export class DrizzleMediaRepository implements MediaRepository {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async findById(id: UniqueId): Promise<Media | null> {
    const [row] = await this.database
      .select()
      .from(mediaTable)
      .where(eq(mediaTable.id, id.value))
      .limit(1);

    return row ? this.map(row) : null;
  }

  public async createPending(media: Media, transaction: DatabaseTransaction): Promise<void> {
    const snapshot = media.toSnapshot();
    await transaction.insert(mediaTable).values({
      id: snapshot.id.value,
      ownerId: snapshot.ownerId.value,
      storageKey: snapshot.storageKey,
      mimeType: snapshot.mimeType,
      sizeBytes: snapshot.sizeBytes,
      status: snapshot.status,
      variants: {},
      metadata: {},
      createdAt: snapshot.createdAt,
      processedAt: null,
    });
  }

  public async save(media: Media, transaction: DatabaseTransaction): Promise<void> {
    const snapshot = media.toSnapshot();
    await transaction
      .update(mediaTable)
      .set({
        status: snapshot.status,
        processedAt: snapshot.processedAt,
      })
      .where(eq(mediaTable.id, snapshot.id.value));
  }

  private map(row: typeof mediaTable.$inferSelect): Media {
    return Media.rehydrate({
      id: UniqueId.create(row.id),
      ownerId: UniqueId.create(row.ownerId),
      storageKey: row.storageKey,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      status: row.status as MediaStatus,
      createdAt: row.createdAt,
      processedAt: row.processedAt,
    });
  }
}
