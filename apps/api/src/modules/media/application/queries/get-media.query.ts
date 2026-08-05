import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { MEDIA_REPOSITORY, type MediaRepository } from '../../domain/ports/media.repository';
import { OBJECT_STORAGE, type ObjectStorage } from '../../domain/ports/object-storage';
import type { MediaPublicView } from '../../media.public';

@Injectable()
export class GetMediaQuery {
  public constructor(
    @Inject(MEDIA_REPOSITORY) private readonly media: MediaRepository,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
  ) {}

  public async execute(mediaId: string): Promise<MediaPublicView | null> {
    const media = await this.media.findById(UniqueId.create(mediaId));
    if (!media) {
      return null;
    }

    const readable = media.status === 'uploaded' || media.status === 'processed';
    const publicUrl = readable
      ? await this.storage.createPresignedDownload({ storageKey: media.storageKey })
      : null;

    return {
      id: media.id.value,
      ownerId: media.ownerId.value,
      mimeType: media.mimeType,
      sizeBytes: Number(media.sizeBytes),
      status: media.status,
      publicUrl,
    };
  }
}
