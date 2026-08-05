import { UniqueId } from '@dreamingcloud/shared-kernel';
import { describe, expect, it } from 'vitest';

import { User } from './user.entity';

describe('User aggregate', () => {
  it('registers as pending and verifies email', () => {
    const user = User.create({
      email: 'ada@example.com',
      username: 'ada',
      displayName: 'Ada',
      correlationId: UniqueId.create(),
    });

    expect(user.status).toBe('pending');
    user.verifyEmail(UniqueId.create());
    expect(user.status).toBe('active');
    expect(user.emailVerifiedAt).not.toBeNull();
  });
});
