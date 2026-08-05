import { NestFactory } from '@nestjs/core';

import { loadEnvFiles } from './platform/config/load-env';
import { WorkerModule } from './worker.module';

export async function bootstrapWorker(): Promise<void> {
  loadEnvFiles();
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['log', 'error', 'warn'],
  });

  app.enableShutdownHooks();
  console.info('DreamingCloud worker: domain-event consumer registered.');
}
