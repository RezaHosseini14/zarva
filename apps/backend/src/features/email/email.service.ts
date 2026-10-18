import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ISendEmailInput {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    const resendKey = this.config.get<string>('RESEND_API_KEY') ?? '';
    const smtpHost = this.config.get<string>('SMTP_HOST') ?? '';
    return resendKey.trim().length > 0 || smtpHost.trim().length > 0;
  }

  async send(input: ISendEmailInput): Promise<boolean> {
    const resendKey = this.config.get<string>('RESEND_API_KEY');
    const from = this.config.get<string>('EMAIL_FROM') ?? 'ZARVA <noreply@zarva.dev>';

    if (resendKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: [input.to],
            subject: input.subject,
            text: input.text,
            html: input.html ?? `<p>${input.text}</p>`,
          }),
        });
        if (!res.ok) {
          const body = await res.text();
          this.logger.warn(`Resend failed: ${res.status} ${body}`);
          return false;
        }
        return true;
      } catch (err) {
        this.logger.warn(`Resend error: ${String(err)}`);
        return false;
      }
    }

    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      // SMTP transport not wired — do not claim delivery success.
      this.logger.warn(
        `[SMTP] configured host=${host} but transport is not implemented; email not sent to=${input.to}`,
      );
      return false;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException(
        'Email is not configured. Set RESEND_API_KEY or SMTP_HOST.',
      );
    }

    this.logger.log(`[email:dev-stub] not delivered to=${input.to} subject=${input.subject}`);
    return false;
  }
}
