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
    const aspiration = published(ownerId, 'private', 'Privée mais publiée');
    const query = new GetAspirationQuery(repoWith(aspiration));
    await expect(query.byId(aspiration.id.value, UniqueId.create().value)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows anonymous viewers to read a public published aspiration', async () => {
    const aspiration = published(UniqueId.create(), 'public', 'Publique et publiée');
    const query = new GetAspirationQuery(repoWith(aspiration));

    const dto = await query.bySlug(aspiration.slug, null);
    expect(dto.status).toBe('published');
    expect(dto.visibility).toBe('public');
    expect(dto.title).toBe('Publique et publiée');
  });

  it('allows authenticated non-owners to read a public published aspiration', async () => {
    const aspiration = published(UniqueId.create(), 'public', 'Accessible aux contributeurs');
    const query = new GetAspirationQuery(repoWith(aspiration));

    const dto = await query.bySlug(aspiration.slug, UniqueId.create().value);
    expect(dto.status).toBe('published');
    expect(dto.visibility).toBe('public');
  });

  it('hides drafts from authenticated non-owners', async () => {
    const aspiration = draft();
    const query = new GetAspirationQuery(repoWith(aspiration));

    await expect(query.bySlug(aspiration.slug, UniqueId.create().value)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

function published(
  ownerId: UniqueId,
  visibility: 'public' | 'private' | 'unlisted',
  title: string,
): Aspiration {
  const aspiration = Aspiration.createDraft({
    ownerId,
    title,
    story: 'Un récit suffisamment détaillé pour passer les validations métier.',
    categoryId: null,
    visibility,
    correlationId: UniqueId.create(),
  });
  aspiration.addNeed({
    needType: 'time',
    title: 'Aide',
    description: null,
    correlationId: UniqueId.create(),
  });
  aspiration.publish(UniqueId.create());
  return aspiration;
}

function repoWith(aspiration: Aspiration): AspirationRepository {
  return {
    findById: async () => aspiration,
    findBySlug: async () => aspiration,
    save: async () => undefined,
    listPublished: async () => [],
  };
}
