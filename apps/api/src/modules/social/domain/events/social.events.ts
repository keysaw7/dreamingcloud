import { UniqueId, type DomainEvent } from '@dreamingcloud/shared-kernel';

type SocialTargetPayload = {
  actorId: string;
  targetType: 'aspiration' | 'user';
  targetId: string;
  commentId?: string;
};

function createSocialEvent(
  name: string,
  aggregateType: string,
  aggregateId: UniqueId,
  actorId: UniqueId,
  correlationId: UniqueId,
  payload: SocialTargetPayload,
): DomainEvent<SocialTargetPayload> {
  return {
    eventId: UniqueId.create(),
    name,
    occurredAt: new Date(),
    actorId,
    aggregateType,
    aggregateId,
    correlationId,
    causationId: null,
    payload,
  };
}

export function createSupportGivenEvent(
  aspirationId: UniqueId,
  actorId: UniqueId,
  correlationId: UniqueId,
): DomainEvent<SocialTargetPayload> {
  return createSocialEvent(
    'social.support.given.v1',
    'aspiration',
    aspirationId,
    actorId,
    correlationId,
    {
      actorId: actorId.value,
      targetType: 'aspiration',
      targetId: aspirationId.value,
    },
  );
}

export function createSupportWithdrawnEvent(
  aspirationId: UniqueId,
  actorId: UniqueId,
  correlationId: UniqueId,
): DomainEvent<SocialTargetPayload> {
  return createSocialEvent(
    'social.support.withdrawn.v1',
    'aspiration',
    aspirationId,
    actorId,
    correlationId,
    {
      actorId: actorId.value,
      targetType: 'aspiration',
      targetId: aspirationId.value,
    },
  );
}

export function createCommentCreatedEvent(
  aspirationId: UniqueId,
  actorId: UniqueId,
  commentId: UniqueId,
  correlationId: UniqueId,
): DomainEvent<SocialTargetPayload> {
  return createSocialEvent(
    'social.comment.created.v1',
    'comment',
    commentId,
    actorId,
    correlationId,
    {
      actorId: actorId.value,
      targetType: 'aspiration',
      targetId: aspirationId.value,
      commentId: commentId.value,
    },
  );
}

export function createSaveCreatedEvent(
  aspirationId: UniqueId,
  actorId: UniqueId,
  correlationId: UniqueId,
): DomainEvent<SocialTargetPayload> {
  return createSocialEvent(
    'social.save.created.v1',
    'aspiration',
    aspirationId,
    actorId,
    correlationId,
    {
      actorId: actorId.value,
      targetType: 'aspiration',
      targetId: aspirationId.value,
    },
  );
}

export function createFollowCreatedEvent(
  followingId: UniqueId,
  actorId: UniqueId,
  correlationId: UniqueId,
): DomainEvent<SocialTargetPayload> {
  return createSocialEvent(
    'social.follow.created.v1',
    'user',
    followingId,
    actorId,
    correlationId,
    {
      actorId: actorId.value,
      targetType: 'user',
      targetId: followingId.value,
    },
  );
}

export function createFollowRemovedEvent(
  followingId: UniqueId,
  actorId: UniqueId,
  correlationId: UniqueId,
): DomainEvent<SocialTargetPayload> {
  return createSocialEvent(
    'social.follow.removed.v1',
    'user',
    followingId,
    actorId,
    correlationId,
    {
      actorId: actorId.value,
      targetType: 'user',
      targetId: followingId.value,
    },
  );
}
