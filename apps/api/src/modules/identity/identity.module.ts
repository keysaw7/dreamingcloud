import { Module } from '@nestjs/common';

import { DeleteAccountUseCase } from './application/commands/delete-account.use-case';
import { LoginUserUseCase } from './application/commands/login-user.use-case';
import { LogoutUserUseCase } from './application/commands/logout-user.use-case';
import { RefreshSessionUseCase } from './application/commands/refresh-session.use-case';
import { RegisterUserUseCase } from './application/commands/register-user.use-case';
import { RequestEmailCodeUseCase } from './application/commands/request-email-code.use-case';
import { RequestPasswordResetUseCase } from './application/commands/request-password-reset.use-case';
import { ResetPasswordUseCase } from './application/commands/reset-password.use-case';
import { UpdateProfileUseCase } from './application/commands/update-profile.use-case';
import { VerifyEmailUseCase } from './application/commands/verify-email.use-case';
import { GetCurrentUserQuery } from './application/queries/get-current-user.query';
import { GetPublicProfileQuery } from './application/queries/get-public-profile.query';
import { EMAIL_OTP_REPOSITORY } from './domain/ports/email-otp.repository';
import { MAILER } from './domain/ports/mailer';
import { PASSWORD_HASHER } from './domain/ports/password-hasher';
import { SESSION_REPOSITORY } from './domain/ports/session.repository';
import { TOKEN_REPOSITORY } from './domain/ports/token.repository';
import { TOKEN_SERVICE } from './domain/ports/token-service';
import { USER_REPOSITORY } from './domain/ports/user.repository';
import { Argon2PasswordHasher } from './infrastructure/crypto/argon2-password-hasher';
import { JoseTokenService } from './infrastructure/crypto/jose-token-service';
import { ConsoleMailer } from './infrastructure/email/console-mailer';
import { ResendMailer } from './infrastructure/email/resend-mailer';
import { DrizzleEmailOtpRepository } from './infrastructure/persistence/drizzle-email-otp.repository';
import { DrizzleSessionRepository } from './infrastructure/persistence/drizzle-session.repository';
import { DrizzleTokenRepository } from './infrastructure/persistence/drizzle-token.repository';
import { DrizzleUserRepository } from './infrastructure/persistence/drizzle-user.repository';
import { IDENTITY_PUBLIC_API } from './identity.public';
import { AuthController } from './presentation/http/auth.controller';
import { UsersController } from './presentation/http/users.controller';
import type { AppConfig } from '../../platform/config/app-config';
import { APP_CONFIG } from '../../platform/config/config.module';
import type { Mailer } from './domain/ports/mailer';

@Module({
  controllers: [AuthController, UsersController],
  providers: [
    RegisterUserUseCase,
    RequestEmailCodeUseCase,
    LoginUserUseCase,
    LogoutUserUseCase,
    RefreshSessionUseCase,
    VerifyEmailUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    UpdateProfileUseCase,
    DeleteAccountUseCase,
    GetCurrentUserQuery,
    GetPublicProfileQuery,
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
    { provide: SESSION_REPOSITORY, useClass: DrizzleSessionRepository },
    { provide: TOKEN_REPOSITORY, useClass: DrizzleTokenRepository },
    { provide: EMAIL_OTP_REPOSITORY, useClass: DrizzleEmailOtpRepository },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JoseTokenService },
    {
      provide: MAILER,
      useFactory: (config: AppConfig): Mailer =>
        config.RESEND_API_KEY ? new ResendMailer(config) : new ConsoleMailer(),
      inject: [APP_CONFIG],
    },
    {
      provide: IDENTITY_PUBLIC_API,
      useFactory: (query: GetCurrentUserQuery) => ({
        getUser: async (userId: string) => {
          try {
            const user = await query.execute(userId);
            return {
              id: user.id,
              email: user.email,
              username: user.username,
              displayName: user.displayName,
              status: user.status,
            };
          } catch {
            return null;
          }
        },
      }),
      inject: [GetCurrentUserQuery],
    },
  ],
  exports: [IDENTITY_PUBLIC_API, TOKEN_SERVICE],
})
export class IdentityModule {}
