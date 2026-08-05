import { AggregateRoot, UniqueId, type DomainEvent } from '@dreamingcloud/shared-kernel';

import type { UserStatus } from '../value-objects/user-status';

export interface UserProps {
  readonly id: UniqueId;
  readonly email: string;
  readonly username: string;
  readonly status: UserStatus;
  readonly emailVerifiedAt: Date | null;
  readonly displayName: string;
  readonly bio: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class User extends AggregateRoot {
  private constructor(private props: UserProps) {
    super();
  }

  public static create(input: {
    email: string;
    username: string;
    displayName: string;
    correlationId: UniqueId;
  }): User {
    const now = new Date();
    const id = UniqueId.create();
    const user = new User({
      id,
      email: input.email.toLowerCase(),
      username: input.username.toLowerCase(),
      status: 'pending',
      emailVerifiedAt: null,
      displayName: input.displayName,
      bio: null,
      createdAt: now,
      updatedAt: now,
    });

    user.addDomainEvent({
      eventId: UniqueId.create(),
      name: 'identity.user.registered.v1',
      occurredAt: now,
      actorId: id,
      aggregateType: 'user',
      aggregateId: id,
      correlationId: input.correlationId,
      causationId: null,
      payload: {
        userId: id.value,
        email: user.email,
        username: user.username,
      },
    });

    return user;
  }

  public static rehydrate(props: UserProps): User {
    return new User(props);
  }

  public get id(): UniqueId {
    return this.props.id;
  }

  public get email(): string {
    return this.props.email;
  }

  public get username(): string {
    return this.props.username;
  }

  public get status(): UserStatus {
    return this.props.status;
  }

  public get emailVerifiedAt(): Date | null {
    return this.props.emailVerifiedAt;
  }

  public get displayName(): string {
    return this.props.displayName;
  }

  public get bio(): string | null {
    return this.props.bio;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public verifyEmail(correlationId: UniqueId): void {
    if (this.props.emailVerifiedAt) {
      return;
    }

    const now = new Date();
    this.props = {
      ...this.props,
      status: 'active',
      emailVerifiedAt: now,
      updatedAt: now,
    };

    this.addDomainEvent({
      eventId: UniqueId.create(),
      name: 'identity.user.email_verified.v1',
      occurredAt: now,
      actorId: this.props.id,
      aggregateType: 'user',
      aggregateId: this.props.id,
      correlationId,
      causationId: null,
      payload: {
        userId: this.props.id.value,
        email: this.props.email,
      },
    } satisfies DomainEvent<{ userId: string; email: string }>);
  }

  public updateProfile(input: {
    displayName: string;
    bio: string | null;
    correlationId: UniqueId;
  }): void {
    const now = new Date();
    this.props = {
      ...this.props,
      displayName: input.displayName,
      bio: input.bio,
      updatedAt: now,
    };

    this.addDomainEvent({
      eventId: UniqueId.create(),
      name: 'identity.user.profile_updated.v1',
      occurredAt: now,
      actorId: this.props.id,
      aggregateType: 'user',
      aggregateId: this.props.id,
      correlationId: input.correlationId,
      causationId: null,
      payload: {
        userId: this.props.id.value,
        displayName: input.displayName,
      },
    });
  }

  public markDeleted(): void {
    this.props = {
      ...this.props,
      status: 'deleted',
      updatedAt: new Date(),
    };
  }

  public toSnapshot(): UserProps {
    return this.props;
  }
}
