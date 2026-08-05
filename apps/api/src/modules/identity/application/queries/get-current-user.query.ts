import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { USER_REPOSITORY, type UserRepository } from '../../domain/ports/user.repository';

export interface UserDto {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly displayName: string;
  readonly bio: string | null;
  readonly status: string;
  readonly emailVerifiedAt: string | null;
}

@Injectable()
export class GetCurrentUserQuery {
  public constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  public async execute(userId: string): Promise<UserDto> {
    const user = await this.users.findById(UniqueId.create(userId));
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return {
      id: user.id.value,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
    };
  }
}
