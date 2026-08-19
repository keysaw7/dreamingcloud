import { EMAIL_OTP_MAX_ATTEMPTS } from '@dreamingcloud/contracts';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import type { TransactionManager } from '../../../../platform/database/database.types';
import type { EventPublisher } from '../../../../platform/events/event-publisher';
import { User } from '../../domain/entities/user.entity';
import type {
  EmailOtpChallenge,
  EmailOtpRepository,
} from '../../domain/ports/email-otp.repository';
import type { PasswordHasher } from '../../domain/ports/password-hasher';
import type { TokenService } from '../../domain/ports/token-service';
import type { UserRepository } from '../../domain/ports/user.repository';
import { EmailOtpVerifier } from '../email-otp-verifier';
import { RegisterUserUseCase } from './register-user.use-case';

class InMemoryUsers implements UserRepository {
  public constructor(public records: User[] = []) {}

  public async findById(): Promise<User | null> {
    return null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.records.find((user) => user.email === email.toLowerCase()) ?? null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    return this.records.find((user) => user.username === username.toLowerCase()) ?? null;
  }

  public async save(user: User): Promise<void> {
    this.records.push(user);
  }

  public async savePasswordHash(): Promise<void> {}

  public async getPasswordHash(): Promise<string | null> {
    return null;
  }

  public async deletePersonalData(): Promise<Record<string, unknown>> {
    return {};
  }
}

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

describe('RegisterUserUseCase', () => {
  const passwordHasher: PasswordHasher = {
    hash: async (password) => `hash:${password}`,
    verify: async () => true,
  };
  const events: EventPublisher = {
    publish: async () => {},
  };
  const transactions: TransactionManager = {
    withinTransaction: async (work) => work({} as never),
  };

  it('creates an active verified user when the email code is valid', async () => {
    const users = new InMemoryUsers();
    const otps = new InMemoryEmailOtps([createChallenge()]);
    const tokens = createTokenService();
    const useCase = new RegisterUserUseCase(
      users,
      passwordHasher,
      tokens,
      otps,
      events,
      transactions,
      new EmailOtpVerifier(otps, tokens),
    );

    const result = await useCase.execute({
      email: 'Ada@Example.com',
      username: 'ada',
      displayName: 'Ada',
      password: 'DemoPass123!',
      emailCode: '123456',
    });

    expect(result.userId).toBeTruthy();
    expect(users.records).toHaveLength(1);
    expect(users.records[0]?.status).toBe('active');
    expect(users.records[0]?.emailVerifiedAt).not.toBeNull();
    expect(otps.items[0]?.consumedAt).not.toBeNull();
  });

  it('rejects an invalid code without creating a user', async () => {
    const users = new InMemoryUsers();
    const otps = new InMemoryEmailOtps([createChallenge()]);
    const tokens = createTokenService();
    const useCase = new RegisterUserUseCase(
      users,
      passwordHasher,
      tokens,
      otps,
      events,
      transactions,
      new EmailOtpVerifier(otps, tokens),
    );

    await expect(
      useCase.execute({
        email: 'ada@example.com',
        username: 'ada',
        displayName: 'Ada',
        password: 'DemoPass123!',
        emailCode: '000000',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(users.records).toHaveLength(0);
    expect(otps.items[0]?.attemptCount).toBe(1);
  });

  it('rejects an expired code', async () => {
    const users = new InMemoryUsers();
    const tokens = createTokenService();
    const otps = new InMemoryEmailOtps([
      createChallenge({ expiresAt: new Date(Date.now() - 1000) }),
    ]);
    const useCase = new RegisterUserUseCase(
      users,
      passwordHasher,
      tokens,
      otps,
      events,
      transactions,
      new EmailOtpVerifier(otps, tokens),
    );

    await expect(
      useCase.execute({
        email: 'ada@example.com',
        username: 'ada',
        displayName: 'Ada',
        password: 'DemoPass123!',
        emailCode: '123456',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(users.records).toHaveLength(0);
  });

  it('locks the challenge after too many invalid attempts', async () => {
    const challenge = createChallenge();
    const otps = new InMemoryEmailOtps([challenge]);
    const tokens = createTokenService();
    const useCase = new RegisterUserUseCase(
      new InMemoryUsers(),
      passwordHasher,
      tokens,
      otps,
      events,
      transactions,
      new EmailOtpVerifier(otps, tokens),
    );
    const input = {
      email: 'ada@example.com',
      username: 'ada',
      displayName: 'Ada',
      password: 'DemoPass123!',
      emailCode: '000000',
    };

    for (let attempt = 0; attempt < EMAIL_OTP_MAX_ATTEMPTS; attempt += 1) {
      await expect(useCase.execute(input)).rejects.toBeInstanceOf(BadRequestException);
    }

    expect(otps.items[0]?.consumedAt).not.toBeNull();
    await expect(useCase.execute({ ...input, emailCode: '123456' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a duplicate email before consuming the code', async () => {
    const existing = User.create({
      email: 'ada@example.com',
      username: 'other',
      displayName: 'Ada',
      correlationId: UniqueId.create(),
    });
    const challenge = createChallenge();
    const otps = new InMemoryEmailOtps([challenge]);
    const tokens = createTokenService();
    const useCase = new RegisterUserUseCase(
      new InMemoryUsers([existing]),
      passwordHasher,
      tokens,
      otps,
      events,
      transactions,
      new EmailOtpVerifier(otps, tokens),
    );

    await expect(
      useCase.execute({
        email: 'ada@example.com',
        username: 'ada',
        displayName: 'Ada',
        password: 'DemoPass123!',
        emailCode: '123456',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(otps.items[0]?.consumedAt).toBeNull();
  });
});
