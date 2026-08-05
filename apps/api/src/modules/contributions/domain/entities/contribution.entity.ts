import { AggregateRoot, UniqueId } from '@dreamingcloud/shared-kernel';

import { canTransition, type ContributionStatus } from '../value-objects/contribution-status';

export type ContributionType =
  | 'material'
  | 'time'
  | 'skill'
  | 'advice'
  | 'contact'
  | 'mentorship'
  | 'partnership'
  | 'job'
  | 'hosting'
  | 'service'
  | 'other';

export interface ContributionProps {
  readonly id: UniqueId;
  readonly aspirationId: UniqueId;
  readonly needId: UniqueId | null;
  readonly contributorId: UniqueId;
  readonly ownerId: UniqueId;
  readonly status: ContributionStatus;
  readonly contributionType: ContributionType;
  readonly description: string;
  readonly conversationId: UniqueId | null;
  readonly completedByContributorAt: Date | null;
  readonly completedByOwnerAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Contribution extends AggregateRoot {
  private constructor(private props: ContributionProps) {
    super();
  }

  public static propose(input: {
    aspirationId: UniqueId;
    ownerId: UniqueId;
    needId: UniqueId | null;
    contributorId: UniqueId;
    contributionType: ContributionType;
    description: string;
    correlationId: UniqueId;
  }): Contribution {
    const now = new Date();
    const id = UniqueId.create();
    const contribution = new Contribution({
      id,
      aspirationId: input.aspirationId,
      needId: input.needId,
      contributorId: input.contributorId,
      ownerId: input.ownerId,
      status: 'proposed',
      contributionType: input.contributionType,
      description: input.description.trim(),
      conversationId: null,
      completedByContributorAt: null,
      completedByOwnerAt: null,
      createdAt: now,
      updatedAt: now,
    });

    contribution.emitStatusEvent('proposed', input.contributorId, input.correlationId);
    return contribution;
  }

  public static rehydrate(props: ContributionProps): Contribution {
    return new Contribution(props);
  }

  public get id(): UniqueId {
    return this.props.id;
  }

  public get aspirationId(): UniqueId {
    return this.props.aspirationId;
  }

  public get needId(): UniqueId | null {
    return this.props.needId;
  }

  public get contributorId(): UniqueId {
    return this.props.contributorId;
  }

  public get ownerId(): UniqueId {
    return this.props.ownerId;
  }

  public get status(): ContributionStatus {
    return this.props.status;
  }

  public get contributionType(): ContributionType {
    return this.props.contributionType;
  }

  public get description(): string {
    return this.props.description;
  }

  public get conversationId(): UniqueId | null {
    return this.props.conversationId;
  }

  public get completedByContributorAt(): Date | null {
    return this.props.completedByContributorAt;
  }

  public get completedByOwnerAt(): Date | null {
    return this.props.completedByOwnerAt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public transition(
    to: ContributionStatus,
    actorId: UniqueId,
    correlationId: UniqueId,
    conversationId?: UniqueId,
  ): void {
    if (!canTransition(this.props.status, to)) {
      throw new Error(`Transition invalide: ${this.props.status} -> ${to}`);
    }

    this.props = {
      ...this.props,
      status: to,
      conversationId: conversationId ?? this.props.conversationId,
      updatedAt: new Date(),
    };

    this.emitStatusEvent(to, actorId, correlationId);
  }

  public confirmCompletion(actorId: UniqueId, correlationId: UniqueId): void {
    if (this.props.status !== 'in_progress' && this.props.status !== 'disputed') {
      throw new Error('La contribution doit être en cours pour être confirmée.');
    }

    const isContributor = actorId.value === this.props.contributorId.value;
    const isOwner = actorId.value === this.props.ownerId.value;
    if (!isContributor && !isOwner) {
      throw new Error('Seul le porteur ou le contributeur peut confirmer.');
    }

    const now = new Date();
    this.props = {
      ...this.props,
      completedByContributorAt: isContributor ? now : this.props.completedByContributorAt,
      completedByOwnerAt: isOwner ? now : this.props.completedByOwnerAt,
      updatedAt: now,
    };

    if (this.props.completedByContributorAt && this.props.completedByOwnerAt) {
      this.transition('completed', actorId, correlationId);
    }
  }

  public toSnapshot(): ContributionProps {
    return this.props;
  }

  private emitStatusEvent(
    status: ContributionStatus,
    actorId: UniqueId,
    correlationId: UniqueId,
  ): void {
    const eventName = `contributions.contribution.${status}.v1`;
    this.addDomainEvent({
      eventId: UniqueId.create(),
      name: eventName,
      occurredAt: new Date(),
      actorId,
      aggregateType: 'contribution',
      aggregateId: this.props.id,
      correlationId,
      causationId: null,
      payload: {
        contributionId: this.props.id.value,
        aspirationId: this.props.aspirationId.value,
        contributorId: this.props.contributorId.value,
        type: this.props.contributionType,
        status,
      },
    });
  }
}
