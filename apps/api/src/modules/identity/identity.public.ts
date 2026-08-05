export interface IdentityPublicUser {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly displayName: string;
  readonly status: string;
}

export interface IdentityPublicApi {
  getUser(userId: string): Promise<IdentityPublicUser | null>;
}

export const IDENTITY_PUBLIC_API = Symbol('IDENTITY_PUBLIC_API');
