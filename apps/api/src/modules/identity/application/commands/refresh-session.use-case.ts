import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import type { AppConfig } from '../../../../platform/config/app-config';
import { APP_CONFIG } from '../../../../platform/config/config.module';
import { SESSION_REPOSITORY, type SessionRepository } from '../../domain/ports/session.repository';
import { TOKEN_SERVICE, type TokenService } from '../../domain/ports/token-service';
import { USER_REPOSITORY, type UserRepository } from '../../domain/ports/user.repository';
import type { AuthTokens } from './login-user.use-case';

@Injectable()
export class RefreshSessionUseCase {
  public constructor(
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  public async execute(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.tokenService.hashOpaqueToken(refreshToken);
    const session = await this.sessions.findByTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedException('Session invalide.');
    }

    if (session.revokedAt || session.expiresAt.getTime() < Date.now()) {
      await this.sessions.revokeFamily(session.familyId);
      throw new UnauthorizedException('Session expirée ou réutilisée.');
    }

    const user = await this.users.findById(session.userId);
    if (!user || user.status === 'deleted' || user.status === 'suspended') {
      throw new UnauthorizedException('Compte indisponible.');
    }

    const nextRefreshToken = this.tokenService.generateOpaqueToken();
    const nextSessionId = UniqueId.create();
    const expiresAt = new Date(
      Date.now() + this.config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.sessions.rotate({
      previousSessionId: session.id,
      nextSession: {
        id: nextSessionId,
        userId: user.id,
        tokenHash: this.tokenService.hashOpaqueToken(nextRefreshToken),
        familyId: session.familyId,
        expiresAt,
        revokedAt: null,
      },
    });

    const accessToken = await this.tokenService.signAccessToken({
      sub: user.id.value,
      email: user.email,
      roles: ['user'],
    });

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      userId: user.id.value,
    };
  }
}
