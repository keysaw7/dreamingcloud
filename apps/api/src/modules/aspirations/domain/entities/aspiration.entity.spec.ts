import { UniqueId } from '@dreamingcloud/shared-kernel';
import { describe, expect, it } from 'vitest';

import { Aspiration } from './aspiration.entity';

describe('Aspiration aggregate', () => {
  it('requires a need or milestone before publish', () => {
    const aspiration = Aspiration.createDraft({
      ownerId: UniqueId.create(),
      title: 'Apprendre le piano',
      story: 'Je souhaite apprendre le piano pour jouer en famille chaque semaine.',
      categoryId: null,
      visibility: 'public',
      correlationId: UniqueId.create(),
    });

    expect(() => aspiration.publish(UniqueId.create())).toThrow(/besoin ou un jalon/i);
  });

  it('publishes when a need exists', () => {
    const aspiration = Aspiration.createDraft({
      ownerId: UniqueId.create(),
      title: 'Apprendre le piano',
      story: 'Je souhaite apprendre le piano pour jouer en famille chaque semaine.',
      categoryId: null,
      visibility: 'public',
      correlationId: UniqueId.create(),
    });

    aspiration.addNeed({
      needType: 'skill',
      title: 'Cours de piano',
      description: null,
      correlationId: UniqueId.create(),
    });

    aspiration.publish(UniqueId.create());
    expect(aspiration.status).toBe('published');
    expect(aspiration.pullDomainEvents().some((event) => event.name.includes('published'))).toBe(
      true,
    );
  });
});
