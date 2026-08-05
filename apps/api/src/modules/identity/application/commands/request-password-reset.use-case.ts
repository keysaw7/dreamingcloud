import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import type { AppConfig } from '../../../../platform/config/app-config';
import { APP_CONFIG } from '../../../../platform/config/config.module';
import { MAILER, type Mailer } from '../../domain/ports/mailer';
import { TOKEN_REPOSITORY, type TokenRepository } from '../../domain/ports/token.repository';
import { TOKEN_SERVICE, type TokenService } from '../../domain/ports/token-service';
import { USER_REPOSITORY, type UserRepository } from '../../domain/ports/user.repository';

@Injectable()
export class RequestPasswordResetUseCase {
  public constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TOKEN_REPOSITORY) private readonly tokens: TokenRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(MAILER) private readonly mailer: Mailer,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  public async execute(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      return;
    }

    const token = this.tokenService.generateOpaqueToken();
    await this.tokens.createPasswordReset({
      id: UniqueId.create(),
      userId: user.id,
      tokenHash: this.tokenService.hashOpaqueToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      usedAt: null,
    });

    await this.mailer.send({
      to: user.email,
      subject: 'Réinitialisation de mot de passe',
      text: `Réinitialisez votre mot de passe : ${this.config.APP_URL}/auth/reset-password?token=${token}`,
    });
  }
}
