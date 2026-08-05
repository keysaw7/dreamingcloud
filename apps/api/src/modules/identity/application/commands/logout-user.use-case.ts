import { Inject, Injectable } from '@nestjs/common';

import { SESSION_REPOSITORY, type SessionRepository } from '../../domain/ports/session.repository';
import { TOKEN_SERVICE, type TokenService } from '../../domain/ports/token-service';

@Injectable()
export class LogoutUserUseCase {
  public constructor(
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) {}

  public async execute(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const session = await this.sessions.findByTokenHash(
      this.tokenService.hashOpaqueToken(refreshToken),
    );
    if (!session) {
      return;
    }

    await this.sessions.revokeFamily(session.familyId);
  }
}
