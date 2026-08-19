import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import { AppModule } from './app.module';
import { loadAppConfig } from './platform/config/app-config';
import { loadEnvFiles } from './platform/config/load-env';
import { ProblemDetailsFilter } from './platform/http/problem-details.filter';
import { PinoLoggerService } from './platform/observability/pino-logger.service';

async function bootstrap(): Promise<void> {
  loadEnvFiles();
  const config = loadAppConfig();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false, trustProxy: true }),
    { bufferLogs: true },
  );
  app.enableShutdownHooks();

  const logger = app.get(PinoLoggerService);
  app.useLogger(logger);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new ProblemDetailsFilter());
  await app.register(cookie as never, { secret: config.COOKIE_SECRET });
  await app.register(helmet as never);
  await app.register(cors as never, { origin: config.CORS_ORIGIN, credentials: true });
  await app.register(rateLimit as never, {
    global: true,
    max: 120,
    timeWindow: '1 minute',
  });

  await app.listen({ host: '0.0.0.0', port: config.PORT });
  if (config.RUN_WORKER_IN_API) {
    logger.log('In-process BullMQ worker enabled (RUN_WORKER_IN_API=true).');
  }
}

void bootstrap();
