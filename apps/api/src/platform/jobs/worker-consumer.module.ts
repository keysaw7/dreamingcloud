import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { FeedModule } from '../../modules/feed/feed.module';
import { MediaModule } from '../../modules/media/media.module';
import { NotificationsModule } from '../../modules/notifications/notifications.module';
import { RankingModule } from '../../modules/ranking/ranking.module';
import { EventsModule } from '../events/events.module';
import { OUTBOX_QUEUE } from '../events/outbox-relay.service';
import { DomainEventProcessor } from './domain-event.processor';

@Module({
  imports: [
    EventsModule,
    RankingModule,
    NotificationsModule,
    FeedModule,
    MediaModule,
    BullModule.registerQueue({ name: OUTBOX_QUEUE }),
  ],
  providers: [DomainEventProcessor],
})
export class WorkerConsumerModule {}
