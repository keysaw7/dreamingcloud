import { Global, Module, forwardRef } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { IdentityModule } from '../../modules/identity/identity.module';
import { AuthGuard } from './auth.guard';
import { CsrfGuard } from './csrf.guard';
import { PolicyGuard } from './policy.guard';

@Global()
@Module({
  imports: [forwardRef(() => IdentityModule)],
  providers: [
    AuthGuard,
    CsrfGuard,
    PolicyGuard,
    {
      provide: APP_GUARD,
      useExisting: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: CsrfGuard,
    },
  ],
  exports: [AuthGuard, CsrfGuard],
})
export class SecurityModule {}
