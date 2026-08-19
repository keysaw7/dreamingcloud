import { Module } from '@nestjs/common';

import { AppConfigModule } from './platform/config/config.module';
import { DatabaseModule } from './platform/database/database.module';
import { EventsModule } from './platform/events/events.module';
import { WorkerConsumerModule } from './platform/jobs/worker-consumer.module';
import { ObservabilityModule } from './platform/observability/observability.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    EventsModule,
    ObservabilityModule,
    WorkerConsumerModule,
  ],
})
export class WorkerModule {}
