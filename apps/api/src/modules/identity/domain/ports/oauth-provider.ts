export const OAUTH_PROVIDER = Symbol('OAUTH_PROVIDER');

export interface OAuthProfile {
  readonly provider: 'google' | 'apple';
  readonly providerAccountId: string;
  readonly email: string;
  readonly displayName: string;
}

/**
 * Port réservé à OAuth. Google est le premier provider ; Apple pourra
 * brancher la même interface sans toucher aux use cases.
 */
export interface OAuthProvider {
  getAuthorizationUrl(state: string): string;
  exchangeCode(code: string): Promise<OAuthProfile>;
}
