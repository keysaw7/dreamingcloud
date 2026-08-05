import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { and, count, eq, isNull } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import { aspirations, follows, userProfiles } from '../../../../platform/database/schema';
import { USER_REPOSITORY, type UserRepository } from '../../domain/ports/user.repository';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface PublicProfileDto {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
  readonly bio: string | null;
  readonly avatarMediaId: string | null;
  readonly followersCount: number;
  readonly followingCount: number;
  readonly aspirations: readonly {
    id: string;
    title: string;
    slug: string;
    story: string;
    progressPercent: number;
    publishedAt: string | null;
  }[];
}

@Injectable()
export class GetPublicProfileQuery {
  public constructor(
    @Inject(USER_REPOSITORY) private readonly usersRepo: UserRepository,
    @Inject(DATABASE) private readonly database: Database,
  ) {}

  public async execute(idOrUsername: string): Promise<PublicProfileDto> {
    let user = null;
    if (UUID_RE.test(idOrUsername)) {
      try {
        user = await this.usersRepo.findById(UniqueId.create(idOrUsername));
      } catch {
        user = null;
      }
    }
    if (!user) {
      user = await this.usersRepo.findByUsername(idOrUsername);
    }

    if (!user || user.status === 'deleted' || user.status === 'suspended') {
      throw new NotFoundException('Profil introuvable.');
    }

    const [profile] = await this.database
      .select({
        bio: userProfiles.bio,
        avatarMediaId: userProfiles.avatarMediaId,
      })
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id.value))
      .limit(1);

    const [followers] = await this.database
      .select({ value: count() })
      .from(follows)
      .where(eq(follows.followingId, user.id.value));

    const [following] = await this.database
      .select({ value: count() })
      .from(follows)
      .where(eq(follows.followerId, user.id.value));

    const published = await this.database
      .select({
        id: aspirations.id,
        title: aspirations.title,
        slug: aspirations.slug,
        story: aspirations.story,
        progressPercent: aspirations.progressPercent,
        publishedAt: aspirations.publishedAt,
      })
      .from(aspirations)
      .where(
        and(
          eq(aspirations.ownerId, user.id.value),
          eq(aspirations.status, 'published'),
          eq(aspirations.visibility, 'public'),
          isNull(aspirations.deletedAt),
        ),
      )
      .limit(50);

    return {
      id: user.id.value,
      username: user.username,
      displayName: user.displayName,
      bio: profile?.bio ?? user.bio,
      avatarMediaId: profile?.avatarMediaId ?? null,
      followersCount: Number(followers?.value ?? 0),
      followingCount: Number(following?.value ?? 0),
      aspirations: published.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        story: item.story,
        progressPercent: item.progressPercent,
        publishedAt: item.publishedAt?.toISOString() ?? null,
      })),
    };
  }
}
