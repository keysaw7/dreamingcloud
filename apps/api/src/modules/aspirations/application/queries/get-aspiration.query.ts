import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { IDENTITY_PUBLIC_API, type IdentityPublicApi } from '../../../identity/identity.public';
import type { Aspiration } from '../../domain/entities/aspiration.entity';
import {
  ASPIRATION_REPOSITORY,
  type AspirationRepository,
} from '../../domain/ports/aspiration.repository';

export interface AspirationDto {
  readonly id: string;
  readonly ownerId: string;
  readonly ownerUsername: string | null;
  readonly ownerDisplayName: string | null;
  readonly title: string;
  readonly slug: string;
  readonly story: string;
  readonly status: string;
  readonly visibility: string;
  readonly progressPercent: number;
  readonly publishedAt: string | null;
  readonly needs: readonly {
    id: string;
    needType: string;
    title: string;
    description: string | null;
    status: string;
  }[];
  readonly milestones: readonly {
    id: string;
    title: string;
    description: string | null;
    position: number;
    completedAt: string | null;
  }[];
}

@Injectable()
export class GetAspirationQuery {
  public constructor(
    @Inject(ASPIRATION_REPOSITORY) private readonly aspirations: AspirationRepository,
    @Inject(IDENTITY_PUBLIC_API) private readonly identity: IdentityPublicApi,
  ) {}

  public async byId(id: string, viewerId: string | null = null): Promise<AspirationDto> {
    const aspiration = await this.aspirations.findById(UniqueId.create(id));
    if (!aspiration) {
      throw new NotFoundException('Aspiration introuvable.');
    }

    this.assertReadable(aspiration, viewerId);
    return this.toDto(aspiration);
  }

  public async bySlug(slug: string, viewerId: string | null = null): Promise<AspirationDto> {
    const aspiration = await this.aspirations.findBySlug(slug);
    if (!aspiration) {
      throw new NotFoundException('Aspiration introuvable.');
    }

    this.assertReadable(aspiration, viewerId);
    return this.toDto(aspiration);
  }

  private assertReadable(aspiration: Aspiration, viewerId: string | null): void {
    const isOwner = viewerId !== null && aspiration.ownerId.value === viewerId;

    if (isOwner) {
      return;
    }

    const isPublishedLike = aspiration.status === 'published' || aspiration.status === 'completed';

    if (!isPublishedLike) {
      throw new NotFoundException('Aspiration introuvable.');
    }

    if (aspiration.visibility === 'private') {
      throw new ForbiddenException('Cette aspiration est privée.');
    }

    if (aspiration.visibility === 'unlisted' && viewerId === null) {
      // Unlisted: accessible via lien direct uniquement pour un utilisateur authentifié
      // (ou le propriétaire). Anonymes → 404 pour éviter l'énumération.
      throw new NotFoundException('Aspiration introuvable.');
    }
  }

  private async toDto(aspiration: Aspiration): Promise<AspirationDto> {
    const owner = await this.identity.getUser(aspiration.ownerId.value);

    return {
      id: aspiration.id.value,
      ownerId: aspiration.ownerId.value,
      ownerUsername: owner?.username ?? null,
      ownerDisplayName: owner?.displayName ?? null,
      title: aspiration.title,
      slug: aspiration.slug,
      story: aspiration.story,
      status: aspiration.status,
      visibility: aspiration.visibility,
      progressPercent: aspiration.progressPercent,
      publishedAt: aspiration.publishedAt?.toISOString() ?? null,
      needs: aspiration.needs.map((need) => ({
        id: need.id.value,
        needType: need.needType,
        title: need.title,
        description: need.description,
        status: need.status,
      })),
      milestones: aspiration.milestones.map((milestone) => ({
        id: milestone.id.value,
        title: milestone.title,
        description: milestone.description,
        position: milestone.position,
        completedAt: milestone.completedAt?.toISOString() ?? null,
      })),
    };
  }
}
