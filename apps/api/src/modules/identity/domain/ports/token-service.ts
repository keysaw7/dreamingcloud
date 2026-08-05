import type { UniqueId } from '@dreamingcloud/shared-kernel';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface AccessTokenClaims {
  readonly sub: string;
  readonly email: string;
  readonly roles: readonly string[];
}

export interface TokenService {
  signAccessToken(claims: AccessTokenClaims): Promise<string>;
  verifyAccessToken(token: string): Promise<AccessTokenClaims>;
  hashOpaqueToken(token: string): string;
  generateOpaqueToken(): string;
  createCorrelationId(): UniqueId;
}
