import { UniqueId, type DomainEvent } from '@dreamingcloud/shared-kernel';

export type MediaUploadedEvent = DomainEvent<{
  mediaId: string;
  ownerId: string;
  mimeType: string;
}>;

export function createMediaUploadedEvent(input: {
  readonly mediaId: UniqueId;
  readonly ownerId: UniqueId;
  readonly mimeType: string;
  readonly correlationId: UniqueId;
}): MediaUploadedEvent {
  return {
    eventId: UniqueId.create(),
    name: 'media.media.uploaded.v1',
    occurredAt: new Date(),
    actorId: input.ownerId,
    aggregateType: 'media',
    aggregateId: input.mediaId,
    correlationId: input.correlationId,
    causationId: null,
    payload: {
      mediaId: input.mediaId.value,
      ownerId: input.ownerId.value,
      mimeType: input.mimeType,
    },
  };
}
