import { Body, Controller, Delete, Get, Inject, Patch, Post, Req, Res } from '@nestjs/common';
import { z } from 'zod';

interface CookieReply {
  status(code: number): CookieReply;
  send(payload: unknown): unknown;
  setCookie(
    name: string,
    value: string,
    options: {
      httpOnly?: boolean;
      sameSite?: 'lax' | 'strict' | 'none';
      secure?: boolean;
      path?: string;
      maxAge?: number;
    },
  ): void;
  clearCookie(name: string, options: { path?: string }): void;
}

import type { AppConfig } from '../../../../platform/config/app-config';
import { APP_CONFIG } from '../../../../platform/config/config.module';
import { Public } from '../../../../platform/security/authorization';
import { CsrfGuard } from '../../../../platform/security/csrf.guard';
import { DeleteAccountUseCase } from '../../application/commands/delete-account.use-case';
import { LoginUserUseCase } from '../../application/commands/login-user.use-case';
import { LogoutUserUseCase } from '../../application/commands/logout-user.use-case';
import { RefreshSessionUseCase } from '../../application/commands/refresh-session.use-case';
import { RegisterUserUseCase } from '../../application/commands/register-user.use-case';
import { RequestPasswordResetUseCase } from '../../application/commands/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../../application/commands/reset-password.use-case';
import { UpdateProfileUseCase } from '../../application/commands/update-profile.use-case';
import { VerifyEmailUseCase } from '../../application/commands/verify-email.use-case';
import { GetCurrentUserQuery } from '../../application/queries/get-current-user.query';
import { CurrentUser } from './current-user.decorator';

const registerSchema = z.object({
  email: z.email(),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(80),
  password: z.string().min(10).max(128),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

@Controller()
export class AuthController {
  public constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly logoutUser: LogoutUserUseCase,
    private readonly verifyEmail: VerifyEmailUseCase,
    private readonly requestPasswordReset: RequestPasswordResetUseCase,
    private readonly resetPassword: ResetPasswordUseCase,
    private readonly updateProfile: UpdateProfileUseCase,
    private readonly deleteAccount: DeleteAccountUseCase,
    private readonly getCurrentUser: GetCurrentUserQuery,
    private readonly csrfGuard: CsrfGuard,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  @Public()
  @Post('auth/register')
  public async register(@Body() body: unknown) {
    const input = registerSchema.parse(body);
    const result = await this.registerUser.execute(input);
    return { data: result };
  }

  @Public()
  @Post('auth/login')
  public async login(@Body() body: unknown, @Res({ passthrough: true }) reply: CookieReply) {
    const input = loginSchema.parse(body);
    const tokens = await this.loginUser.execute(input);
    this.setAuthCookies(reply, tokens.accessToken, tokens.refreshToken);
    this.setCsrfCookie(reply);
    return { data: { userId: tokens.userId } };
  }

  @Public()
  @Post('auth/refresh')
  public async refresh(
    @Req() request: { cookies?: Record<string, string | undefined> },
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      return reply.status(401).send({
        type: 'https://api.dreamingcloud.app/problems/401',
        title: 'Unauthorized',
        status: 401,
      });
    }

    const tokens = await this.refreshSession.execute(refreshToken);
    this.setAuthCookies(reply, tokens.accessToken, tokens.refreshToken);
    this.setCsrfCookie(reply);
    return { data: { userId: tokens.userId } };
  }

  @Public()
  @Post('auth/logout')
  public async logout(
    @Req() request: { cookies?: Record<string, string | undefined> },
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    await this.logoutUser.execute(request.cookies?.refresh_token);
    reply.clearCookie('access_token', { path: '/' });
    reply.clearCookie('refresh_token', { path: '/' });
    reply.clearCookie('csrf_token', { path: '/' });
    return { data: { ok: true } };
  }

  @Public()
  @Post('auth/verify-email')
  public async verify(@Body() body: unknown) {
    const input = z.object({ token: z.string().min(1) }).parse(body);
    await this.verifyEmail.execute(input.token);
    return { data: { ok: true } };
  }

  @Public()
  @Post('auth/request-password-reset')
  public async requestReset(@Body() body: unknown) {
    const input = z.object({ email: z.email() }).parse(body);
    await this.requestPasswordReset.execute(input.email);
    return { data: { ok: true } };
  }

  @Public()
  @Post('auth/reset-password')
  public async reset(@Body() body: unknown) {
    const input = z
      .object({
        token: z.string().min(1),
        password: z.string().min(10).max(128),
      })
      .parse(body);
    await this.resetPassword.execute(input);
    return { data: { ok: true } };
  }

  @Get('me')
  public async me(@CurrentUser() userId: string) {
    return { data: await this.getCurrentUser.execute(userId) };
  }

  @Patch('me')
  public async patchMe(@CurrentUser() userId: string, @Body() body: unknown) {
    const input = z
      .object({
        displayName: z.string().min(1).max(80),
        bio: z.string().max(500).nullable(),
      })
      .parse(body);
    await this.updateProfile.execute({ userId, ...input });
    return { data: await this.getCurrentUser.execute(userId) };
  }

  @Get('me/export')
  public async exportMe(@CurrentUser() userId: string) {
    const profile = await this.getCurrentUser.execute(userId);
    return {
      data: {
        exportedAt: new Date().toISOString(),
        profile,
        notice:
          'Export minimal MVP. Les aspirations, contributions et messages liés restent accessibles via leurs endpoints dédiés.',
      },
    };
  }

  @Delete('me')
  public async deleteMe(
    @CurrentUser() userId: string,
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    const exported = await this.deleteAccount.execute(userId);
    reply.clearCookie('access_token', { path: '/' });
    reply.clearCookie('refresh_token', { path: '/' });
    reply.clearCookie('csrf_token', { path: '/' });
    return { data: { deleted: true, export: exported } };
  }

  private setAuthCookies(reply: CookieReply, accessToken: string, refreshToken: string): void {
    const secure = this.config.COOKIE_SECURE;
    reply.setCookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: this.config.JWT_ACCESS_TTL_SECONDS,
    });
    reply.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: this.config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
    });
  }

  private setCsrfCookie(reply: CookieReply): void {
    reply.setCookie('csrf_token', this.csrfGuard.issueToken(), {
      httpOnly: false,
      sameSite: 'lax',
      secure: this.config.COOKIE_SECURE,
      path: '/',
      maxAge: this.config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
    });
  }
}
