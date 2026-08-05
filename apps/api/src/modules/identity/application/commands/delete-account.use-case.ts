import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { SESSION_REPOSITORY, type SessionRepository } from '../../domain/ports/session.repository';
import { USER_REPOSITORY, type UserRepository } from '../../domain/ports/user.repository';

@Injectable()
export class DeleteAccountUseCase {
  public constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
  ) {}

  public async execute(userId: string): Promise<Record<string, unknown>> {
    const user = await this.users.findById(UniqueId.create(userId));
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    await this.sessions.revokeAllForUser(user.id);
    return this.users.deletePersonalData(user.id);
  }
}
