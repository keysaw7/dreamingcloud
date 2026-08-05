import type { UniqueId } from '@dreamingcloud/shared-kernel';

import type { Contribution } from '../entities/contribution.entity';

export const CONTRIBUTION_REPOSITORY = Symbol('CONTRIBUTION_REPOSITORY');

export interface ContributionRepository {
  findById(id: UniqueId): Promise<Contribution | null>;
  save(contribution: Contribution): Promise<void>;
  listByAspiration(aspirationId: UniqueId): Promise<readonly Contribution[]>;
}
