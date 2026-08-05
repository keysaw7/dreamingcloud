import { UniqueId, type DomainEvent } from '@dreamingcloud/shared-kernel';

export type AspirationPublishedEvent = DomainEvent<{
  aspirationId: string;
  ownerId: string;
}>;

export function createAspirationPublishedEvent(
  aspirationId: UniqueId,
  ownerId: UniqueId,
  correlationId: UniqueId,
): AspirationPublishedEvent {
  return {
    eventId: UniqueId.create(),
    name: 'aspirations.aspiration.published.v1',
    occurredAt: new Date(),
    actorId: ownerId,
    aggregateType: 'aspiration',
    aggregateId: aspirationId,
    correlationId,
    causationId: null,
    payload: {
      aspirationId: aspirationId.value,
      ownerId: ownerId.value,
    },
  };
}
