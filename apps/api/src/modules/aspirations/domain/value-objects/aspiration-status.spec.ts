import { describe, expect, it } from 'vitest';

import { aspirationStatuses } from './aspiration-status';

describe('aspirationStatuses', () => {
  it('exposes only the supported lifecycle states', () => {
    expect(aspirationStatuses).toEqual(['draft', 'published', 'completed', 'archived']);
  });
});
