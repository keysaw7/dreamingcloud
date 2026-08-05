import { AggregateRoot, UniqueId } from '@dreamingcloud/shared-kernel';

import { createMediaUploadedEvent } from '../events/media-uploaded.event';

export type MediaStatus = 'pending' | 'uploaded' | 'processed' | 'rejected';

export interface MediaProps {
  readonly id: UniqueId;
  readonly ownerId: UniqueId;
  readonly storageKey: string;
  readonly mimeType: string;
  readonly sizeBytes: bigint;
  readonly status: MediaStatus;
  readonly createdAt: Date;
  readonly processedAt: Date | null;
}

export class Media extends AggregateRoot {
  private constructor(private props: MediaProps) {
    super();
  }

  public static createPending(input: {
    readonly ownerId: UniqueId;
    readonly mimeType: string;
    readonly sizeBytes: bigint;
    readonly extension: string;
  }): Media {
    const id = UniqueId.create();
    return new Media({
      id,
      ownerId: input.ownerId,
      storageKey: `uploads/${input.ownerId.value}/${id.value}.${input.extension}`,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      status: 'pending',
      createdAt: new Date(),
      processedAt: null,
    });
  }

  public static rehydrate(props: MediaProps): Media {
    return new Media(props);
  }

  public get id(): UniqueId {
    return this.props.id;
  }

  public get ownerId(): UniqueId {
    return this.props.ownerId;
  }

  public get storageKey(): string {
    return this.props.storageKey;
  }

  public get mimeType(): string {
    return this.props.mimeType;
  }

  public get sizeBytes(): bigint {
    return this.props.sizeBytes;
  }

  public get status(): MediaStatus {
    return this.props.status;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get processedAt(): Date | null {
    return this.props.processedAt;
  }

  public confirmUpload(correlationId: UniqueId): void {
    if (this.props.status === 'uploaded') {
      return;
    }

    if (this.props.status !== 'pending') {
      throw new Error('Seul un média en attente peut être confirmé.');
    }

    this.props = {
      ...this.props,
      status: 'uploaded',
    };

    this.addDomainEvent(
      createMediaUploadedEvent({
        mediaId: this.id,
        ownerId: this.ownerId,
        mimeType: this.mimeType,
        correlationId,
      }),
    );
  }

  public markProcessed(): void {
    this.props = {
      ...this.props,
      status: 'processed',
      processedAt: new Date(),
    };
  }

  public markRejected(): void {
    this.props = {
      ...this.props,
      status: 'rejected',
      processedAt: new Date(),
    };
  }

  public toSnapshot(): MediaProps {
    return this.props;
  }
}
