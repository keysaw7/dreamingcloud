import { afterEach, describe, expect, it } from 'vitest';

import { resolveApiBaseUrl } from './api';

describe('resolveApiBaseUrl', () => {
  const originalInternal = process.env.API_INTERNAL_URL;
  const originalPublic = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    if (originalInternal === undefined) {
      delete process.env.API_INTERNAL_URL;
    } else {
      process.env.API_INTERNAL_URL = originalInternal;
    }

    if (originalPublic === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalPublic;
    }
  });

  it('prefers API_INTERNAL_URL on the server', () => {
    process.env.API_INTERNAL_URL = 'https://api.example.com/api/v1/';
    process.env.NEXT_PUBLIC_API_URL = '/api/v1';
    expect(resolveApiBaseUrl()).toBe('https://api.example.com/api/v1');
  });

  it('rejects a relative public URL on the server', () => {
    delete process.env.API_INTERNAL_URL;
    process.env.NEXT_PUBLIC_API_URL = '/api/v1';
    expect(() => resolveApiBaseUrl()).toThrow(/API_INTERNAL_URL/);
  });

  it('falls back to the local API when no env is set', () => {
    delete process.env.API_INTERNAL_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(resolveApiBaseUrl()).toBe('http://localhost:3001/api/v1');
  });
});
