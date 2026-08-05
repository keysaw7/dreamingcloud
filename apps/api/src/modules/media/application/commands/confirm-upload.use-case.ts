import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { EVENT_PUBLISHER, type EventPublisher } from '../../../../platform/events/event-publisher';
import { MEDIA_REPOSITORY, type MediaRepository } from '../../domain/ports/media.repository';
import { OBJECT_STORAGE, type ObjectStorage } from '../../domain/ports/object-storage';

export interface ConfirmUploadInput {
  readonly mediaId: string;
  readonly ownerId: string;
}

@Injectable()
export class ConfirmUploadUseCase {
  public constructor(
    @Inject(MEDIA_REPOSITORY) private readonly media: MediaRepository,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: ConfirmUploadInput): Promise<{ mediaId: string }> {
    const mediaId = UniqueId.create(input.mediaId);
    const existing = await this.media.findById(mediaId);
    if (!existing) {
      throw new NotFoundException('Média introuvable.');
    }

    if (existing.ownerId.value !== input.ownerId) {
      throw new ForbiddenException('Vous ne pouvez confirmer que vos propres médias.');
    }

    if (existing.status === 'processed' || existing.status === 'rejected') {
      throw new ForbiddenException('Ce média ne peut plus être confirmé.');
    }

    if (existing.status === 'uploaded') {
      return { mediaId: input.mediaId };
    }

    if (!(await this.storage.objectExists(existing.storageKey))) {
      throw new NotFoundException('Fichier introuvable dans le stockage.');
    }

    const correlationId = UniqueId.create();
    existing.confirmUpload(correlationId);

    await this.transactions.withinTransaction(async (transaction) => {
      await this.media.save(existing, transaction);
      await this.events.publish(transaction, existing.pullDomainEvents());
    });

    return { mediaId: input.mediaId };
  }
}
