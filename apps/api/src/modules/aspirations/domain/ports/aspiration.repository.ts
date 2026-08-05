import type { UniqueId } from '@dreamingcloud/shared-kernel';

import type { Aspiration } from '../entities/aspiration.entity';

export const ASPIRATION_REPOSITORY = Symbol('ASPIRATION_REPOSITORY');

export interface AspirationRepository {
  findById(id: UniqueId): Promise<Aspiration | null>;
  findBySlug(slug: string): Promise<Aspiration | null>;
  save(aspiration: Aspiration): Promise<void>;
  listPublished(input: {
    limit: number;
    cursorPublishedAt?: Date;
    cursorId?: string;
  }): Promise<readonly Aspiration[]>;
}
