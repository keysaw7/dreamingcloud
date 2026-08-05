import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import type { AppConfig } from '../../../../platform/config/app-config';
import { APP_CONFIG } from '../../../../platform/config/config.module';
import { PASSWORD_HASHER, type PasswordHasher } from '../../domain/ports/password-hasher';
import { SESSION_REPOSITORY, type SessionRepository } from '../../domain/ports/session.repository';
import { TOKEN_SERVICE, type TokenService } from '../../domain/ports/token-service';
import { USER_REPOSITORY, type UserRepository } from '../../domain/ports/user.repository';

export interface LoginUserInput {
  readonly email: string;
  readonly password: string;
}

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly userId: string;
}

@Injectable()
export class LoginUserUseCase {
  public constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  public async execute(input: LoginUserInput): Promise<AuthTokens> {
    const user = await this.users.findByEmail(input.email);
    if (!user || user.status === 'deleted' || user.status === 'suspended') {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    if (user.status === 'pending') {
      throw new UnauthorizedException('Vérifiez votre adresse e-mail avant de vous connecter.');
    }

    const passwordHash = await this.users.getPasswordHash(user.id);
    if (!passwordHash || !(await this.passwordHasher.verify(input.password, passwordHash))) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const refreshToken = this.tokenService.generateOpaqueToken();
    const familyId = UniqueId.create();
    const sessionId = UniqueId.create();
    const expiresAt = new Date(
      Date.now() + this.config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.sessions.create({
      id: sessionId,
      userId: user.id,
      tokenHash: this.tokenService.hashOpaqueToken(refreshToken),
      familyId,
      expiresAt,
      revokedAt: null,
    });

    const accessToken = await this.tokenService.signAccessToken({
      sub: user.id.value,
      email: user.email,
      roles: ['user'],
    });

    return {
      accessToken,
      refreshToken,
      userId: user.id.value,
    };
  }
}
