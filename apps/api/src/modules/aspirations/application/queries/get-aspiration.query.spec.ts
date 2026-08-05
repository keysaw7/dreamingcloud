import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { describe, expect, it } from 'vitest';

import { Aspiration } from '../../domain/entities/aspiration.entity';
import type { AspirationRepository } from '../../domain/ports/aspiration.repository';
import { GetAspirationQuery } from './get-aspiration.query';

function draft(ownerId = UniqueId.create()): Aspiration {
  return Aspiration.createDraft({
    ownerId,
    title: 'Titre de test assez long',
    story: 'Un récit suffisamment détaillé pour passer les validations métier.',
    categoryId: null,
    visibility: 'public',
    correlationId: UniqueId.create(),
  });
}

describe('GetAspirationQuery authorization', () => {
  it('hides drafts from anonymous viewers', async () => {
    const aspiration = draft();
    const query = new GetAspirationQuery(repoWith(aspiration));

    await expect(query.byId(aspiration.id.value, null)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('allows owners to read their drafts', async () => {
    const ownerId = UniqueId.create();
    const aspiration = draft(ownerId);
    const query = new GetAspirationQuery(repoWith(aspiration));

    const dto = await query.byId(aspiration.id.value, ownerId.value);
    expect(dto.status).toBe('draft');
  });

  it('forbids private published aspirations for non-owners', async () => {
    const ownerId = UniqueId.create();
    const aspiration = Aspiration.createDraft({
      ownerId,
      title: 'Privée mais publiée',
      story: 'Un récit suffisamment détaillé pour passer les validations métier.',
      categoryId: null,
      visibility: 'private',
      correlationId: UniqueId.create(),
    });
    aspiration.addNeed({
      needType: 'time',
      title: 'Aide',
      description: null,
      correlationId: UniqueId.create(),
    });
    aspiration.publish(UniqueId.create());

    const query = new GetAspirationQuery(repoWith(aspiration));
    await expect(query.byId(aspiration.id.value, UniqueId.create().value)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});

function repoWith(aspiration: Aspiration): AspirationRepository {
  return {
    findById: async () => aspiration,
    findBySlug: async () => aspiration,
    save: async () => undefined,
    listPublished: async () => [],
  };
}
