import { describe, expect, it } from 'vitest';

import { UniqueId } from './unique-id.js';

describe('UniqueId.isValid', () => {
  it('accepts generated UUIDv7 values', () => {
    expect(UniqueId.isValid(UniqueId.create().value)).toBe(true);
  });

  it('rejects long aspiration slugs that only look UUID-like by length', () => {
    const longSlug = 'residence-artistique-en-zone-rurale-019fd703';
    expect(longSlug.length).toBeGreaterThan(32);
    expect(longSlug.includes('-')).toBe(true);
    expect(UniqueId.isValid(longSlug)).toBe(false);
  });
});
