import type { UniqueId } from '@dreamingcloud/shared-kernel';

import type { DatabaseTransaction } from '../../../../platform/database/database.types';
import type { Media } from '../entities/media.entity';

export const MEDIA_REPOSITORY = Symbol('MEDIA_REPOSITORY');

export interface MediaRepository {
  findById(id: UniqueId): Promise<Media | null>;
  createPending(media: Media, transaction: DatabaseTransaction): Promise<void>;
  save(media: Media, transaction: DatabaseTransaction): Promise<void>;
}
