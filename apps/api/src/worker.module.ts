import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { FeedModule } from './modules/feed/feed.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { AppConfigModule } from './platform/config/config.module';
import { DatabaseModule } from './platform/database/database.module';
import { EventsModule } from './platform/events/events.module';
import { OUTBOX_QUEUE } from './platform/events/outbox-relay.service';
import { DomainEventProcessor } from './platform/jobs/domain-event.processor';
import { ObservabilityModule } from './platform/observability/observability.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    EventsModule,
    ObservabilityModule,
    RankingModule,
    NotificationsModule,
    FeedModule,
    MediaModule,
    BullModule.registerQueue({ name: OUTBOX_QUEUE }),
  ],
  providers: [DomainEventProcessor],
})
export class WorkerModule {}
