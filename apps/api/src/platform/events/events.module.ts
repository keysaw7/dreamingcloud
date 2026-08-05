import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';

import type { AppConfig } from '../config/app-config';
import { APP_CONFIG } from '../config/config.module';
import { EVENT_PUBLISHER } from './event-publisher';
import { OutboxRelayService, OUTBOX_QUEUE } from './outbox-relay.service';
import { OutboxRepository } from './outbox.repository';
import { TransactionalEventPublisher } from './transactional-event-publisher';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => {
        const redis = new URL(config.REDIS_URL);
        return {
          connection: {
            host: redis.hostname,
            port: Number(redis.port || 6379),
            username: redis.username || undefined,
            password: redis.password || undefined,
            ...(redis.protocol === 'rediss:' ? { tls: {} } : {}),
          },
        };
      },
    }),
    BullModule.registerQueue({ name: OUTBOX_QUEUE }),
  ],
  providers: [
    OutboxRepository,
    OutboxRelayService,
    TransactionalEventPublisher,
    {
      provide: EVENT_PUBLISHER,
      useExisting: TransactionalEventPublisher,
    },
  ],
  exports: [EVENT_PUBLISHER],
})
export class EventsModule {}
