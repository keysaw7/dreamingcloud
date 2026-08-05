import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';

import type { RequestPrincipal } from '../../../../platform/security/authorization';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<{ principal?: RequestPrincipal }>();
    if (!request.principal?.userId) {
      throw new UnauthorizedException();
    }

    return request.principal.userId;
  },
);
