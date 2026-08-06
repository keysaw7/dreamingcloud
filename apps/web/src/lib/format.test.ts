import { describe, expect, it } from 'vitest';

import { contributionStatusLabel, needTypeLabel } from './format';

describe('contributionStatusLabel', () => {
  it('maps known contribution statuses', () => {
    expect(contributionStatusLabel('proposed')).toBe('Proposée');
    expect(contributionStatusLabel('accepted')).toBe('Acceptée');
    expect(contributionStatusLabel('in_progress')).toBe('En cours');
    expect(contributionStatusLabel('completed')).toBe('Terminée');
  });

  it('falls back to the raw status', () => {
    expect(contributionStatusLabel('unknown_status')).toBe('unknown_status');
  });
});

describe('needTypeLabel', () => {
  it('maps need types used by the MVP', () => {
    expect(needTypeLabel('skill')).toBe('Compétence');
    expect(needTypeLabel('time')).toBe('Temps');
    expect(needTypeLabel('material')).toBe('Matériel');
  });
});
