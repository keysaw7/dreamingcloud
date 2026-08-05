import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PASSWORD_HASHER, type PasswordHasher } from '../../domain/ports/password-hasher';
import { SESSION_REPOSITORY, type SessionRepository } from '../../domain/ports/session.repository';
import { TOKEN_REPOSITORY, type TokenRepository } from '../../domain/ports/token.repository';
import { TOKEN_SERVICE, type TokenService } from '../../domain/ports/token-service';
import { USER_REPOSITORY, type UserRepository } from '../../domain/ports/user.repository';

@Injectable()
export class ResetPasswordUseCase {
  public constructor(
    @Inject(TOKEN_REPOSITORY) private readonly tokens: TokenRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
  ) {}

  public async execute(input: { token: string; password: string }): Promise<void> {
    const consumed = await this.tokens.consumePasswordReset(
      this.tokenService.hashOpaqueToken(input.token),
    );

    if (!consumed) {
      throw new BadRequestException('Jeton de réinitialisation invalide ou expiré.');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    await this.users.savePasswordHash(consumed.userId, passwordHash);
    await this.sessions.revokeAllForUser(consumed.userId);
  }
}
