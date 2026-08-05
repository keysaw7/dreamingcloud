import { Injectable, Logger } from '@nestjs/common';

import type { AppConfig } from '../../../../platform/config/app-config';
import type { Mailer } from '../../domain/ports/mailer';

@Injectable()
export class ResendMailer implements Mailer {
  private readonly logger = new Logger(ResendMailer.name);

  public constructor(private readonly config: AppConfig) {}

  public async send(input: { to: string; subject: string; text: string }): Promise<void> {
    const apiKey = this.config.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required for ResendMailer.');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.config.EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    });

    if (!response.ok) {
      this.logger.error(`Resend delivery failed with status ${response.status}`);
      throw new Error('Échec d’envoi e-mail.');
    }

    this.logger.log(`Mail queued for delivery (to redacted).`);
  }
}
