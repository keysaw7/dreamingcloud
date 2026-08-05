import { AggregateRoot, UniqueId, type DomainEvent } from '@dreamingcloud/shared-kernel';

import type { AspirationStatus } from '../value-objects/aspiration-status';

export type AspirationVisibility = 'public' | 'unlisted' | 'private';

export interface AspirationNeed {
  readonly id: UniqueId;
  readonly needType: 'skill' | 'material' | 'time' | 'contact' | 'other' | 'money';
  readonly title: string;
  readonly description: string | null;
  readonly status: 'open' | 'fulfilled' | 'cancelled';
}

export interface AspirationMilestone {
  readonly id: UniqueId;
  readonly title: string;
  readonly description: string | null;
  readonly position: number;
  readonly completedAt: Date | null;
}

export interface AspirationProps {
  readonly id: UniqueId;
  readonly ownerId: UniqueId;
  readonly title: string;
  readonly slug: string;
  readonly story: string;
  readonly categoryId: UniqueId | null;
  readonly status: AspirationStatus;
  readonly visibility: AspirationVisibility;
  readonly progressPercent: number;
  readonly needs: readonly AspirationNeed[];
  readonly milestones: readonly AspirationMilestone[];
  readonly publishedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

function slugify(title: string): string {
  return `${title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)}-${UniqueId.create().value.slice(0, 8)}`;
}

export class Aspiration extends AggregateRoot {
  private constructor(private props: AspirationProps) {
    super();
  }

  public static createDraft(input: {
    ownerId: UniqueId;
    title: string;
    story: string;
    categoryId: UniqueId | null;
    visibility: AspirationVisibility;
    correlationId: UniqueId;
  }): Aspiration {
    const now = new Date();
    const id = UniqueId.create();
    const aspiration = new Aspiration({
      id,
      ownerId: input.ownerId,
      title: input.title.trim(),
      slug: slugify(input.title),
      story: input.story.trim(),
      categoryId: input.categoryId,
      status: 'draft',
      visibility: input.visibility,
      progressPercent: 0,
      needs: [],
      milestones: [],
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    aspiration.addDomainEvent({
      eventId: UniqueId.create(),
      name: 'aspirations.aspiration.created.v1',
      occurredAt: now,
      actorId: input.ownerId,
      aggregateType: 'aspiration',
      aggregateId: id,
      correlationId: input.correlationId,
      causationId: null,
      payload: {
        aspirationId: id.value,
        ownerId: input.ownerId.value,
        status: 'draft',
      },
    });

    return aspiration;
  }

  public static rehydrate(props: AspirationProps): Aspiration {
    return new Aspiration(props);
  }

  public get id(): UniqueId {
    return this.props.id;
  }

  public get ownerId(): UniqueId {
    return this.props.ownerId;
  }

  public get title(): string {
    return this.props.title;
  }

  public get slug(): string {
    return this.props.slug;
  }

  public get story(): string {
    return this.props.story;
  }

  public get status(): AspirationStatus {
    return this.props.status;
  }

  public get visibility(): AspirationVisibility {
    return this.props.visibility;
  }

  public get categoryId(): UniqueId | null {
    return this.props.categoryId;
  }

  public get progressPercent(): number {
    return this.props.progressPercent;
  }

  public get needs(): readonly AspirationNeed[] {
    return this.props.needs;
  }

  public get milestones(): readonly AspirationMilestone[] {
    return this.props.milestones;
  }

  public get publishedAt(): Date | null {
    return this.props.publishedAt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateDraft(input: {
    title: string;
    story: string;
    categoryId: UniqueId | null;
    visibility: AspirationVisibility;
    correlationId: UniqueId;
  }): void {
    if (this.props.status !== 'draft') {
      throw new Error('Seuls les brouillons peuvent être modifiés librement.');
    }

    this.props = {
      ...this.props,
      title: input.title.trim(),
      story: input.story.trim(),
      categoryId: input.categoryId,
      visibility: input.visibility,
      updatedAt: new Date(),
    };

    this.emitUpdated(input.correlationId);
  }

  public addNeed(input: {
    needType: AspirationNeed['needType'];
    title: string;
    description: string | null;
    correlationId: UniqueId;
  }): AspirationNeed {
    const need: AspirationNeed = {
      id: UniqueId.create(),
      needType: input.needType,
      title: input.title.trim(),
      description: input.description,
      status: 'open',
    };

    this.props = {
      ...this.props,
      needs: [...this.props.needs, need],
      updatedAt: new Date(),
    };
    this.emitUpdated(input.correlationId);
    return need;
  }

  public addMilestone(input: {
    title: string;
    description: string | null;
    correlationId: UniqueId;
  }): AspirationMilestone {
    const milestone: AspirationMilestone = {
      id: UniqueId.create(),
      title: input.title.trim(),
      description: input.description,
      position: this.props.milestones.length + 1,
      completedAt: null,
    };

    this.props = {
      ...this.props,
      milestones: [...this.props.milestones, milestone],
      updatedAt: new Date(),
    };
    this.emitUpdated(input.correlationId);
    return milestone;
  }

  public publish(correlationId: UniqueId): void {
    if (this.props.status !== 'draft') {
      throw new Error('Seuls les brouillons peuvent être publiés.');
    }

    if (this.props.title.trim().length < 3 || this.props.story.trim().length < 20) {
      throw new Error('Le titre et le récit doivent être suffisamment détaillés.');
    }

    if (this.props.needs.length === 0 && this.props.milestones.length === 0) {
      throw new Error('Ajoutez au moins un besoin ou un jalon avant publication.');
    }

    const now = new Date();
    this.props = {
      ...this.props,
      status: 'published',
      publishedAt: now,
      updatedAt: now,
    };

    this.addDomainEvent({
      eventId: UniqueId.create(),
      name: 'aspirations.aspiration.published.v1',
      occurredAt: now,
      actorId: this.props.ownerId,
      aggregateType: 'aspiration',
      aggregateId: this.props.id,
      correlationId,
      causationId: null,
      payload: {
        aspirationId: this.props.id.value,
        ownerId: this.props.ownerId.value,
        status: 'published',
      },
    } satisfies DomainEvent<{ aspirationId: string; ownerId: string; status: string }>);
  }

  public archive(correlationId: UniqueId): void {
    this.props = {
      ...this.props,
      status: 'archived',
      updatedAt: new Date(),
    };
    this.emitUpdated(correlationId);
  }

  public updateProgress(progressPercent: number, correlationId: UniqueId): void {
    const clamped = Math.max(0, Math.min(100, progressPercent));
    this.props = {
      ...this.props,
      progressPercent: clamped,
      updatedAt: new Date(),
    };

    this.addDomainEvent({
      eventId: UniqueId.create(),
      name: 'aspirations.aspiration.progress_changed.v1',
      occurredAt: new Date(),
      actorId: this.props.ownerId,
      aggregateType: 'aspiration',
      aggregateId: this.props.id,
      correlationId,
      causationId: null,
      payload: {
        aspirationId: this.props.id.value,
        ownerId: this.props.ownerId.value,
        progressPercent: clamped,
      },
    });
  }

  public toSnapshot(): AspirationProps {
    return this.props;
  }

  private emitUpdated(correlationId: UniqueId): void {
    this.addDomainEvent({
      eventId: UniqueId.create(),
      name: 'aspirations.aspiration.updated.v1',
      occurredAt: new Date(),
      actorId: this.props.ownerId,
      aggregateType: 'aspiration',
      aggregateId: this.props.id,
      correlationId,
      causationId: null,
      payload: {
        aspirationId: this.props.id.value,
        ownerId: this.props.ownerId.value,
        status: this.props.status,
      },
    });
  }
}
