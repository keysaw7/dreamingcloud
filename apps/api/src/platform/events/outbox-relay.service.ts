import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationShutdown,
  type OnModuleInit,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import type { AppConfig } from '../config/app-config';
import { APP_CONFIG } from '../config/config.module';
import { OutboxRepository } from './outbox.repository';

export const OUTBOX_QUEUE = 'outbox';

@Injectable()
export class OutboxRelayService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(OutboxRelayService.name);
  private timer: NodeJS.Timeout | undefined;
  private draining = false;

  public constructor(
    @InjectQueue(OUTBOX_QUEUE) private readonly queue: Queue,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(OutboxRepository) private readonly outboxRepository: OutboxRepository,
  ) {}

  public onModuleInit(): void {
    this.timer = setInterval(() => void this.drain(), this.config.OUTBOX_POLL_INTERVAL_MS);
    void this.drain();
  }

  public onApplicationShutdown(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async drain(): Promise<void> {
    if (this.draining) {
      return;
    }

    this.draining = true;
    try {
      const events = await this.outboxRepository.claimBatch(100);
      for (const event of events) {
        await this.queue.add('domain-event', event, {
          jobId: event.id,
          removeOnComplete: 1000,
          removeOnFail: 5000,
        });
        await this.outboxRepository.markPublished(event.id);
      }
    } catch (error) {
      this.logger.error('Unable to relay transactional outbox events.', error);
    } finally {
      this.draining = false;
    }
  }
}
