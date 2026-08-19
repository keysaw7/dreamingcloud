import { Module } from '@nestjs/common';

import { AspirationsModule } from './modules/aspirations/aspirations.module';
import { ContributionsModule } from './modules/contributions/contributions.module';
import { FeedModule } from './modules/feed/feed.module';
import { IdentityModule } from './modules/identity/identity.module';
import { MediaModule } from './modules/media/media.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { SocialModule } from './modules/social/social.module';
import { AppConfigModule } from './platform/config/config.module';
import { loadEnvFiles } from './platform/config/load-env';
import { DatabaseModule } from './platform/database/database.module';
import { EventsModule } from './platform/events/events.module';
import { HealthController } from './platform/http/health.controller';
import { WorkerConsumerModule } from './platform/jobs/worker-consumer.module';
import { ObservabilityModule } from './platform/observability/observability.module';
import { SecurityModule } from './platform/security/security.module';

loadEnvFiles();

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    EventsModule,
    ObservabilityModule,
    IdentityModule,
    SecurityModule,
    MediaModule,
    AspirationsModule,
    SocialModule,
    RankingModule,
    FeedModule,
    MessagingModule,
    ContributionsModule,
    NotificationsModule,
    ModerationModule,
    ...(process.env.RUN_WORKER_IN_API === 'true' ? [WorkerConsumerModule] : []),
  ],
  controllers: [HealthController],
})
export class AppModule {}
