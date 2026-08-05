import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import type { AppConfig } from '../config/app-config';
import { APP_CONFIG } from '../config/config.module';

type CsrfRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string | undefined>;
};

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  public constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<CsrfRequest>();
    const method = (request.method ?? 'GET').toUpperCase();

    if (SAFE_METHODS.has(method)) {
      return true;
    }

    // Bearer-token API clients are not subject to browser CSRF.
    const authorization = request.headers.authorization;
    const header = Array.isArray(authorization) ? authorization[0] : authorization;
    if (header?.startsWith('Bearer ')) {
      return true;
    }

    // Public unauthenticated auth endpoints bootstrap the session (no CSRF yet).
    const pathHeader = request.headers['x-forwarded-path'];
    void pathHeader;

    const cookieToken = request.cookies?.csrf_token;
    const headerTokenRaw = request.headers['x-csrf-token'];
    const headerToken = Array.isArray(headerTokenRaw) ? headerTokenRaw[0] : headerTokenRaw;

    // Allow first-party login/register/refresh without prior CSRF cookie.
    if (!cookieToken && !headerToken) {
      const url = String((request as CsrfRequest & { url?: string }).url ?? '');
      if (
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/verify-email') ||
        url.includes('/auth/request-password-reset') ||
        url.includes('/auth/reset-password') ||
        url.includes('/auth/logout')
      ) {
        return true;
      }
    }

    if (!cookieToken || !headerToken || !this.tokensMatch(cookieToken, headerToken)) {
      throw new ForbiddenException('Jeton CSRF manquant ou invalide.');
    }

    return true;
  }

  public issueToken(): string {
    const nonce = randomBytes(32).toString('base64url');
    const signature = createHmac('sha256', this.config.CSRF_SECRET)
      .update(nonce)
      .digest('base64url');
    return `${nonce}.${signature}`;
  }

  private tokensMatch(cookieToken: string, headerToken: string): boolean {
    const left = Buffer.from(cookieToken);
    const right = Buffer.from(headerToken);
    if (left.length !== right.length) {
      return false;
    }

    return timingSafeEqual(left, right);
  }
}
