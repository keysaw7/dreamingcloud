import { Injectable, Logger } from '@nestjs/common';

import type { Mailer } from '../../domain/ports/mailer';

@Injectable()
export class ConsoleMailer implements Mailer {
  private readonly logger = new Logger(ConsoleMailer.name);

  public async send(input: { to: string; subject: string; text: string }): Promise<void> {
    // Never log tokens / full email bodies — redact sensitive query params.
    const redacted = input.text
      .replace(/token=[^\s&]+/gi, 'token=[REDACTED]')
      .replace(/[A-Za-z0-9_-]{20,}/g, '[REDACTED_TOKEN]');

    this.logger.log(`Mail to=${maskEmail(input.to)} subject=${input.subject}\n${redacted}`);
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) {
    return '[redacted]';
  }

  return `${local.slice(0, 1)}***@${domain}`;
}
