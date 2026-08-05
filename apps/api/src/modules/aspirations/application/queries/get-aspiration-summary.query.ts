import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import type { AspirationSummary, AspirationsPublicApi } from '../../aspirations.public';
import {
  ASPIRATION_REPOSITORY,
  type AspirationRepository,
} from '../../domain/ports/aspiration.repository';

@Injectable()
export class GetAspirationSummaryQuery implements AspirationsPublicApi {
  public constructor(
    @Inject(ASPIRATION_REPOSITORY) private readonly aspirationRepository: AspirationRepository,
  ) {}

  public async getSummary(aspirationId: string): Promise<AspirationSummary | null> {
    const aspiration = await this.aspirationRepository.findById(UniqueId.create(aspirationId));

    if (!aspiration) {
      return null;
    }

    return {
      id: aspiration.id.value,
      ownerId: aspiration.ownerId.value,
      title: aspiration.title,
      status: aspiration.status,
      visibility: aspiration.visibility,
    };
  }
}
