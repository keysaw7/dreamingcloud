import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { RequestPrincipal } from '../../../../platform/security/authorization';

export const OptionalUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | null => {
    const request = context.switchToHttp().getRequest<{ principal?: RequestPrincipal }>();
    return request.principal?.userId ?? null;
  },
);
