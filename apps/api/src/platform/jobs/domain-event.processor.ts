import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { Job } from 'bullmq';

import { ProjectPublishedAspirationService } from '../../modules/feed/application/commands/project-published-aspiration.service';
import { NotificationsEventHandler } from '../../modules/notifications/application/notifications-event-handler.service';
import { RankingEventHandler } from '../../modules/ranking/application/ranking-event-handler.service';
import type { OutboxEvent } from '../events/outbox.repository';
import { OUTBOX_QUEUE } from '../events/outbox-relay.service';

export const MEDIA_UPLOADED_PROCESSOR = Symbol('MEDIA_UPLOADED_PROCESSOR');

export interface MediaUploadedProcessor {
  processUploaded(input: { mediaId: string; ownerId: string; mimeType: string }): Promise<void>;
}

@Injectable()
@Processor(OUTBOX_QUEUE)
export class DomainEventProcessor extends WorkerHost {
  private readonly logger = new Logger(DomainEventProcessor.name);

  public constructor(
    @Inject(RankingEventHandler)
    private readonly rankingHandler: RankingEventHandler,
    @Inject(NotificationsEventHandler)
    private readonly notificationsHandler: NotificationsEventHandler,
    @Inject(ProjectPublishedAspirationService)
    private readonly feedProjection: ProjectPublishedAspirationService,
    @Optional()
    @Inject(MEDIA_UPLOADED_PROCESSOR)
    private readonly mediaProcessor: MediaUploadedProcessor | null,
  ) {
    super();
  }

  public async process(job: Job<OutboxEvent>): Promise<void> {
    if (job.name !== 'domain-event') {
      return;
    }

    const event = job.data;
    const envelope = {
      id: event.id,
      eventId: event.id,
      name: event.name,
      occurredAt: event.occurredAt,
      actorId: event.actorId,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      correlationId: event.correlationId,
      causationId: event.causationId,
      payload: event.payload,
    };

    await this.rankingHandler.handle(envelope);
    await this.notificationsHandler.handle(envelope);
    await this.feedProjection.handle(envelope);

    if (event.name === 'media.media.uploaded.v1') {
      await this.handleMediaUploaded(event);
    }
  }

  private async handleMediaUploaded(event: OutboxEvent): Promise<void> {
    const mediaId =
      typeof event.payload.mediaId === 'string' ? event.payload.mediaId : event.aggregateId;
    const ownerId =
      typeof event.payload.ownerId === 'string' ? event.payload.ownerId : (event.actorId ?? '');
    const mimeType =
      typeof event.payload.mimeType === 'string'
        ? event.payload.mimeType
        : 'application/octet-stream';

    if (this.mediaProcessor) {
      await this.mediaProcessor.processUploaded({ mediaId, ownerId, mimeType });
      return;
    }

    this.logger.log(
      `media.media.uploaded.v1 received for ${mediaId} (${mimeType}); no media processor registered — skipping sharp re-encode stub`,
    );
  }
}
