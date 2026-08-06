import { describe, expect, it } from 'vitest';

import { contributionStatusLabel } from '../../lib/format';

const ACTIONABLE = new Set(['proposed', 'in_discussion', 'accepted', 'in_progress', 'disputed']);

function canShowOwnerActions(status: string, isOwner: boolean): boolean {
  if (!isOwner) {
    return false;
  }
  return status === 'proposed' || status === 'in_discussion';
}

function canConfirmCompletion(status: string): boolean {
  return status === 'in_progress' || status === 'disputed';
}

describe('contribution UI rules', () => {
  it('exposes readable labels for the MVP statuses', () => {
    for (const status of ACTIONABLE) {
      expect(contributionStatusLabel(status).length).toBeGreaterThan(0);
      expect(contributionStatusLabel(status)).not.toBe(status);
    }
  });

  it('limits owner decision actions to proposed and discussion', () => {
    expect(canShowOwnerActions('proposed', true)).toBe(true);
    expect(canShowOwnerActions('in_discussion', true)).toBe(true);
    expect(canShowOwnerActions('accepted', true)).toBe(false);
    expect(canShowOwnerActions('proposed', false)).toBe(false);
  });

  it('allows bilateral confirmation only while in progress or disputed', () => {
    expect(canConfirmCompletion('in_progress')).toBe(true);
    expect(canConfirmCompletion('disputed')).toBe(true);
    expect(canConfirmCompletion('accepted')).toBe(false);
  });
});
