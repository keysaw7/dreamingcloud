import { describe, expect, it } from 'vitest';

import { canTransition } from './contribution-status';

describe('contribution status machine', () => {
  it('allows the happy path', () => {
    expect(canTransition('proposed', 'accepted')).toBe(true);
    expect(canTransition('accepted', 'in_progress')).toBe(true);
    expect(canTransition('in_progress', 'completed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransition('completed', 'proposed')).toBe(false);
    expect(canTransition('declined', 'accepted')).toBe(false);
    expect(canTransition('proposed', 'completed')).toBe(false);
  });
});
