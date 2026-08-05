import { SetMetadata } from '@nestjs/common';

export interface RequestPrincipal {
  readonly userId: string;
  readonly roles: readonly string[];
  readonly policies: readonly string[];
}

export const IS_PUBLIC = 'security:is-public';
export const REQUIRED_POLICIES = 'security:required-policies';

export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC, true);
export const RequirePolicies = (...policies: string[]): MethodDecorator & ClassDecorator =>
  SetMetadata(REQUIRED_POLICIES, policies);
