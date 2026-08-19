import { UniqueId } from '@dreamingcloud/shared-kernel';
import { describe, expect, it } from 'vitest';

import { User } from '../../domain/entities/user.entity';
import type {
  EmailOtpChallenge,
  EmailOtpRepository,
} from '../../domain/ports/email-otp.repository';
import type { Mailer } from '../../domain/ports/mailer';
import type { TokenService } from '../../domain/ports/token-service';
import type { UserRepository } from '../../domain/ports/user.repository';
import { RequestEmailCodeUseCase } from './request-email-code.use-case';

class InMemoryUsers implements UserRepository {
  public constructor(public readonly records: User[] = []) {}

  public async findById(): Promise<User | null> {
    return null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.records.find((user) => user.email === email.toLowerCase()) ?? null;
  }

  public async findByUsername(): Promise<User | null> {
    return null;
  }

  public async save(): Promise<void> {}

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

function createTokenService(code = '123456'): TokenService {
  return {
    signAccessToken: async () => '',
    verifyAccessToken: async () => ({ sub: '', email: '', roles: [] }),
    hashOpaqueToken: (token) => token,
    generateOpaqueToken: () => 'opaque',
    generateEmailOtp: () => code,
    hashEmailOtp: (email, otp) => `${email.toLowerCase()}:${otp}`,
    createCorrelationId: () => UniqueId.create(),
  };
}

describe('RequestEmailCodeUseCase', () => {
  it('sends a code when the email is available', async () => {
    const sent: Array<{ to: string; text: string }> = [];
    const mailer: Mailer = {
      send: async (input) => {
        sent.push(input);
      },
    };
    const otps = new InMemoryEmailOtps();
    const useCase = new RequestEmailCodeUseCase(
      new InMemoryUsers(),
      otps,
      createTokenService(),
      mailer,
    );

    await useCase.execute('Ada@Example.com');

    expect(sent).toHaveLength(1);
    expect(sent[0]?.to).toBe('ada@example.com');
    expect(sent[0]?.text).toContain('123456');
    expect(otps.items).toHaveLength(1);
    expect(otps.items[0]?.email).toBe('ada@example.com');
  });

  it('does not send when the email is already registered', async () => {
    const sent: unknown[] = [];
    const existing = User.create({
      email: 'ada@example.com',
      username: 'ada',
      displayName: 'Ada',
      correlationId: UniqueId.create(),
    });
    const useCase = new RequestEmailCodeUseCase(
      new InMemoryUsers([existing]),
      new InMemoryEmailOtps(),
      createTokenService(),
      {
        send: async () => {
          sent.push('sent');
        },
      },
    );

    await useCase.execute('ada@example.com');

    expect(sent).toHaveLength(0);
  });

  it('does not send another code during the cooldown window', async () => {
    const sent: unknown[] = [];
    const otps = new InMemoryEmailOtps([
      {
        id: UniqueId.create(),
        email: 'ada@example.com',
        codeHash: 'ada@example.com:111111',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        consumedAt: null,
        attemptCount: 0,
        createdAt: new Date(),
      },
    ]);
    const useCase = new RequestEmailCodeUseCase(
      new InMemoryUsers(),
      otps,
      createTokenService('654321'),
      {
        send: async () => {
          sent.push('sent');
        },
      },
    );

    await useCase.execute('ada@example.com');

    expect(sent).toHaveLength(0);
    expect(otps.items).toHaveLength(1);
    expect(otps.items[0]?.codeHash).toBe('ada@example.com:111111');
  });

  it('replaces the previous code after the cooldown', async () => {
    const sent: Array<{ text: string }> = [];
    const previousId = UniqueId.create();
    const otps = new InMemoryEmailOtps([
      {
        id: previousId,
        email: 'ada@example.com',
        codeHash: 'ada@example.com:111111',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        consumedAt: null,
        attemptCount: 0,
        createdAt: new Date(Date.now() - 61_000),
      },
    ]);
    const useCase = new RequestEmailCodeUseCase(
      new InMemoryUsers(),
      otps,
      createTokenService('654321'),
      {
        send: async (input) => {
          sent.push(input);
        },
      },
    );

    await useCase.execute('ada@example.com');

    expect(sent).toHaveLength(1);
    expect(sent[0]?.text).toContain('654321');
    const previous = otps.items.find((item) => item.id.equals(previousId));
    expect(previous?.consumedAt).not.toBeNull();
    const active = await otps.findLatestActive('ada@example.com');
    expect(active?.codeHash).toBe('ada@example.com:654321');
  });
});
