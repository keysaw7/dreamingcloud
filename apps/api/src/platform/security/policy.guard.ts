import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC, type RequestPrincipal, REQUIRED_POLICIES } from './authorization';

type PrincipalRequest = { principal?: RequestPrincipal };

@Injectable()
export class PolicyGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<PrincipalRequest>();
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
}
