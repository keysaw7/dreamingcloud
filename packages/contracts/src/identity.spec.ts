import { describe, expect, it } from 'vitest';

import { passwordSchema, registerUserSchema, verifyEmailCodeSchema } from './identity.js';

describe('passwordSchema', () => {
  it('accepts a strong password', () => {
    expect(passwordSchema.safeParse('DemoPass123!').success).toBe(true);
  });

  it('rejects passwords that are too short', () => {
    expect(passwordSchema.safeParse('Ab1!short').success).toBe(false);
  });

  it('rejects passwords without mixed case, digit or special character', () => {
    expect(passwordSchema.safeParse('alllowercase1!').success).toBe(false);
    expect(passwordSchema.safeParse('ALLUPPERCASE1!').success).toBe(false);
    expect(passwordSchema.safeParse('NoDigitsHere!').success).toBe(false);
    expect(passwordSchema.safeParse('NoSpecials12').success).toBe(false);
  });
});

describe('registerUserSchema', () => {
  it('requires a 6-digit email code', () => {
    const base = {
      email: 'ada@example.com',
      username: 'ada',
      displayName: 'Ada',
      password: 'DemoPass123!',
    };

    expect(registerUserSchema.safeParse({ ...base, emailCode: '123456' }).success).toBe(true);
    expect(registerUserSchema.safeParse({ ...base, emailCode: '12345' }).success).toBe(false);
    expect(registerUserSchema.safeParse({ ...base, emailCode: 'abcdef' }).success).toBe(false);
  });
});

describe('verifyEmailCodeSchema', () => {
  it('requires a valid email and a 6-digit code', () => {
    expect(
      verifyEmailCodeSchema.safeParse({ email: 'ada@example.com', emailCode: '123456' }).success,
    ).toBe(true);
    expect(
      verifyEmailCodeSchema.safeParse({ email: 'not-an-email', emailCode: '123456' }).success,
    ).toBe(false);
    expect(
      verifyEmailCodeSchema.safeParse({ email: 'ada@example.com', emailCode: '12345' }).success,
    ).toBe(false);
  });
});
