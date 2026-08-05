import { Injectable, type LoggerService } from '@nestjs/common';
import pino, { type Logger } from 'pino';

@Injectable()
export class PinoLoggerService implements LoggerService {
  private readonly logger: Logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    redact: ['req.headers.authorization', 'password', 'refreshToken', 'accessToken'],
  });

  public log(message: unknown, context?: string): void {
    this.logger.info({ context }, String(message));
  }

  public error(message: unknown, trace?: string, context?: string): void {
    this.logger.error({ context, trace }, String(message));
  }

  public warn(message: unknown, context?: string): void {
    this.logger.warn({ context }, String(message));
  }

  public debug(message: unknown, context?: string): void {
    this.logger.debug({ context }, String(message));
  }

  public verbose(message: unknown, context?: string): void {
    this.logger.trace({ context }, String(message));
  }
}
