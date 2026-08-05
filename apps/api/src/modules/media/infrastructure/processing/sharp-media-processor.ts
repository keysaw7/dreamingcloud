import { Inject, Injectable, Logger } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import sharp from 'sharp';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import type { MediaUploadedProcessor } from '../../../../platform/jobs/domain-event.processor';
import { MEDIA_REPOSITORY, type MediaRepository } from '../../domain/ports/media.repository';
import { OBJECT_STORAGE, type ObjectStorage } from '../../domain/ports/object-storage';

@Injectable()
export class SharpMediaProcessor implements MediaUploadedProcessor {
  private readonly logger = new Logger(SharpMediaProcessor.name);

  public constructor(
    @Inject(MEDIA_REPOSITORY) private readonly media: MediaRepository,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async processUploaded(input: {
    mediaId: string;
    ownerId: string;
    mimeType: string;
  }): Promise<void> {
    const entity = await this.media.findById(UniqueId.create(input.mediaId));
    if (!entity) {
      this.logger.warn(`Media ${input.mediaId} introuvable pour traitement.`);
      return;
    }

    if (!(await this.storage.objectExists(entity.storageKey))) {
      this.logger.warn(`Objet S3 manquant pour media ${input.mediaId}`);
      return;
    }

    if (input.mimeType.startsWith('image/')) {
      const original = await this.storage.getObjectBuffer(entity.storageKey);
      const processed = await sharp(original)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .jpeg({ mozjpeg: true, quality: 82 })
        .toBuffer();

      const processedKey = entity.storageKey.replace(/\.[^.]+$/, '.processed.jpg');
      await this.storage.putObject({
        storageKey: processedKey,
        body: processed,
        mimeType: 'image/jpeg',
      });
    }

    entity.markProcessed();
    await this.transactions.withinTransaction(async (transaction) => {
      await this.media.save(entity, transaction);
    });

    this.logger.log(`Media ${input.mediaId} traité (${input.mimeType}).`);
  }
}
