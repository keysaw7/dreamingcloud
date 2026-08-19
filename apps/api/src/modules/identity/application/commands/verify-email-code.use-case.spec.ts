import { EMAIL_OTP_MAX_ATTEMPTS, EMAIL_OTP_VERIFIED_TTL_MINUTES } from '@dreamingcloud/contracts';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import type {
  EmailOtpChallenge,
  EmailOtpRepository,
} from '../../domain/ports/email-otp.repository';
import type { TokenService } from '../../domain/ports/token-service';
import { EmailOtpVerifier } from '../email-otp-verifier';
import { VerifyEmailCodeUseCase } from './verify-email-code.use-case';

class InMemoryEmailOtps implements EmailOtpRepository {
  public constructor(public items: EmailOtpChallenge[] = []) {}

  public async findLatestActive(email: string): Promise<EmailOtpChallenge | null> {
    return (
      this.items
        .filter((item) => item.email === email && item.consumedAt === null)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0] ?? null
    );
  }

  public async create(challenge: EmailOtpChallenge): Promise<void> {
    this.items.push(challenge);
  }

  public async invalidateActive(email: string): Promise<void> {
    this.items = this.items.map((item) =>
      item.email === email && item.consumedAt === null ? { ...item, consumedAt: new Date() } : item,
    );
  }

  public async markConsumed(id: UniqueId): Promise<void> {
    this.items = this.items.map((item) =>
      item.id.equals(id) ? { ...item, consumedAt: new Date() } : item,
    );
  }

  public async incrementAttempts(id: UniqueId): Promise<number> {
    const current = this.items.find((item) => item.id.equals(id));
    if (!current) {
      return 0;
    }

    const next = { ...current, attemptCount: current.attemptCount + 1 };
    this.items = this.items.map((item) => (item.id.equals(id) ? next : item));
    return next.attemptCount;
  }

  public async extendExpiry(id: UniqueId, expiresAt: Date): Promise<void> {
    this.items = this.items.map((item) => (item.id.equals(id) ? { ...item, expiresAt } : item));
  }
}

function createTokenService(): TokenService {
  return {
    signAccessToken: async () => '',
    verifyAccessToken: async () => ({ sub: '', email: '', roles: [] }),
    hashOpaqueToken: (token) => token,
    generateOpaqueToken: () => 'opaque',
    generateEmailOtp: () => '123456',
    hashEmailOtp: (email, otp) => `${email.toLowerCase()}:${otp}`,
    createCorrelationId: () => UniqueId.create(),
  };
}

function createChallenge(overrides: Partial<EmailOtpChallenge> = {}): EmailOtpChallenge {
  return {
    id: UniqueId.create(),
    email: 'ada@example.com',
    codeHash: 'ada@example.com:123456',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    consumedAt: null,
    attemptCount: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

function createUseCase(otps: InMemoryEmailOtps): VerifyEmailCodeUseCase {
  const tokens = createTokenService();
  return new VerifyEmailCodeUseCase(new EmailOtpVerifier(otps, tokens), otps);
}

describe('VerifyEmailCodeUseCase', () => {
  it('accepts a valid code without consuming it and extends expiry', async () => {
    const before = Date.now();
    const otps = new InMemoryEmailOtps([createChallenge()]);
    const useCase = createUseCase(otps);

    await useCase.execute('Ada@Example.com', '123456');

    expect(otps.items[0]?.consumedAt).toBeNull();
    expect(otps.items[0]?.attemptCount).toBe(0);
    const extended = otps.items[0]?.expiresAt.getTime() ?? 0;
    expect(extended).toBeGreaterThanOrEqual(before + EMAIL_OTP_VERIFIED_TTL_MINUTES * 60 * 1000);
  });

  it('rejects an invalid code and increments attempts', async () => {
    const otps = new InMemoryEmailOtps([createChallenge()]);
    const useCase = createUseCase(otps);

    await expect(useCase.execute('ada@example.com', '000000')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(otps.items[0]?.attemptCount).toBe(1);
    expect(otps.items[0]?.consumedAt).toBeNull();
  });

  it('locks the challenge after too many invalid attempts', async () => {
    const otps = new InMemoryEmailOtps([createChallenge()]);
    const useCase = createUseCase(otps);

    for (let attempt = 0; attempt < EMAIL_OTP_MAX_ATTEMPTS; attempt += 1) {
      await expect(useCase.execute('ada@example.com', '000000')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    }

    expect(otps.items[0]?.consumedAt).not.toBeNull();
    await expect(useCase.execute('ada@example.com', '123456')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects an expired code', async () => {
    const otps = new InMemoryEmailOtps([
      createChallenge({ expiresAt: new Date(Date.now() - 1000) }),
    ]);
    const useCase = createUseCase(otps);

    await expect(useCase.execute('ada@example.com', '123456')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(otps.items[0]?.consumedAt).toBeNull();
  });
});
