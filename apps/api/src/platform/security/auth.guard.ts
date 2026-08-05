import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Inject } from '@nestjs/common';

import {
  TOKEN_SERVICE,
  type TokenService,
} from '../../modules/identity/domain/ports/token-service';
import { IS_PUBLIC, type RequestPrincipal, REQUIRED_POLICIES } from './authorization';

type AuthenticatedRequest = {
  headers: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string | undefined>;
  principal?: RequestPrincipal;
};

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    private readonly reflector: Reflector,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken = this.extractAccessToken(request);

    if (accessToken) {
      try {
        const claims = await this.tokenService.verifyAccessToken(accessToken);
        request.principal = {
          userId: claims.sub,
          roles: claims.roles,
          policies: ['authenticated', ...claims.roles.map((role) => `role:${role}`)],
        };
      } catch {
        if (!isPublic) {
          throw new UnauthorizedException();
        }
      }
    }

    if (isPublic) {
      return true;
    }

    if (!request.principal) {
      throw new UnauthorizedException();
    }

    const requiredPolicies =
      this.reflector.getAllAndOverride<readonly string[]>(REQUIRED_POLICIES, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    return requiredPolicies.every((policy) => request.principal?.policies.includes(policy));
  }

  private extractAccessToken(request: AuthenticatedRequest): string | null {
    const authorization = request.headers.authorization;
    const header = Array.isArray(authorization) ? authorization[0] : authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice('Bearer '.length);
    }

    return request.cookies?.access_token ?? null;
  }
}
