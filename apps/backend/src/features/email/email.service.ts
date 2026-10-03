import { Injectable, Logger } from '@nestjs/common';
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
      this.logger.log(
        `[SMTP stub] to=${input.to} subject=${input.subject} (configure SMTP transport or RESEND_API_KEY)`,
      );
      return true;
    }

    this.logger.log(`[email:dev] to=${input.to} subject=${input.subject}\n${input.text}`);
    return true;
  }
}
