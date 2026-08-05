import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { TRANSACTION_MANAGER } from '../../../../platform/database/database.module';
import type { TransactionManager } from '../../../../platform/database/database.types';
import { Media } from '../../domain/entities/media.entity';
import { MEDIA_REPOSITORY, type MediaRepository } from '../../domain/ports/media.repository';
import { OBJECT_STORAGE, type ObjectStorage } from '../../domain/ports/object-storage';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export interface RequestUploadInput {
  readonly ownerId: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
}

export interface RequestUploadResult {
  readonly mediaId: string;
  readonly uploadUrl: string;
}

@Injectable()
export class RequestUploadUseCase {
  public constructor(
    @Inject(MEDIA_REPOSITORY) private readonly media: MediaRepository,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
  ) {}

  public async execute(input: RequestUploadInput): Promise<RequestUploadResult> {
    if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
      throw new BadRequestException(
        'Type MIME non autorisé. Formats acceptés : image/jpeg, image/png, image/webp.',
      );
    }

    if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) {
      throw new BadRequestException('La taille du fichier doit être positive.');
    }

    if (input.sizeBytes > MAX_SIZE_BYTES) {
      throw new BadRequestException('La taille maximale autorisée est de 10 Mo.');
    }

    const media = Media.createPending({
      ownerId: UniqueId.create(input.ownerId),
      mimeType: input.mimeType,
      sizeBytes: BigInt(input.sizeBytes),
      extension: extensionForMime(input.mimeType),
    });

    await this.transactions.withinTransaction(async (transaction) => {
      await this.media.createPending(media, transaction);
    });

    const { uploadUrl } = await this.storage.createPresignedUpload({
      storageKey: media.storageKey,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    });

    return {
      mediaId: media.id.value,
      uploadUrl,
    };
  }
}

function extensionForMime(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'bin';
  }
}
