import { createHash, createHmac, randomBytes, randomInt } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { SignJWT, importPKCS8, importSPKI, jwtVerify, type JWTPayload } from 'jose';

import type { AppConfig } from '../../../../platform/config/app-config';
import { isPemKeyPair } from '../../../../platform/config/app-config';
import { APP_CONFIG } from '../../../../platform/config/config.module';
import { TokenService } from '../../domain/ports/token-service';
import type { AccessTokenClaims } from '../../domain/ports/token-service';

type JoseKey = CryptoKey | Uint8Array;

@Injectable()
export class JoseTokenService implements TokenService {
  private readonly ready: Promise<void>;
  private algorithm: 'RS256' | 'HS256' = 'HS256';
  private privateKey!: JoseKey;
  private publicKey!: JoseKey;

  public constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    this.ready = this.initializeKeys();
  }

  public async signAccessToken(claims: AccessTokenClaims): Promise<string> {
    await this.ready;
    return new SignJWT({
      email: claims.email,
      roles: claims.roles,
    })
      .setProtectedHeader({ alg: this.algorithm })
      .setSubject(claims.sub)
      .setIssuedAt()
      .setExpirationTime(`${this.config.JWT_ACCESS_TTL_SECONDS}s`)
      .sign(this.privateKey);
  }

  public async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    await this.ready;
    const { payload } = await jwtVerify(token, this.publicKey, {
      algorithms: [this.algorithm],
    });
    return this.toClaims(payload);
  }

  public hashOpaqueToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  public generateOpaqueToken(): string {
    return randomBytes(32).toString('base64url');
  }

  public generateEmailOtp(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  public hashEmailOtp(email: string, code: string): string {
    return createHmac('sha256', this.config.CSRF_SECRET)
      .update(`${email.toLowerCase()}:${code}`)
      .digest('hex');
  }

  public createCorrelationId(): UniqueId {
    return UniqueId.create();
  }

  private async initializeKeys(): Promise<void> {
    if (isPemKeyPair(this.config)) {
      const privatePem = this.config.JWT_PRIVATE_KEY_PEM.replace(/\\n/g, '\n');
      const publicPem = this.config.JWT_PUBLIC_KEY_PEM.replace(/\\n/g, '\n');
      this.algorithm = 'RS256';
      this.privateKey = await importPKCS8(privatePem, 'RS256');
      this.publicKey = await importSPKI(publicPem, 'RS256');
      return;
    }

    if (this.config.NODE_ENV === 'production') {
      throw new Error('JWT PEM key pair required in production.');
    }

    this.algorithm = 'HS256';
    const secret = new TextEncoder().encode(`jwt:${this.config.COOKIE_SECRET}`);
    this.privateKey = secret;
    this.publicKey = secret;
  }

  private toClaims(payload: JWTPayload): AccessTokenClaims {
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      throw new Error('Invalid access token payload.');
    }

    const roles = Array.isArray(payload.roles)
      ? payload.roles.filter((role): role is string => typeof role === 'string')
      : [];

    return {
      sub: payload.sub,
      email: payload.email,
      roles,
    };
  }
}
