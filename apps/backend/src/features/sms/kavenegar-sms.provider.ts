import {
  BadGatewayException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  ISmsLookupTokens,
  ISmsProvider,
  ISmsSendResult,
} from './sms.types';

interface IKavenegarReturn {
  readonly status: number;
  readonly message: string;
}

interface IKavenegarEntry {
  readonly messageid?: number;
}

interface IKavenegarResponse {
  readonly return: IKavenegarReturn;
  readonly entries?: IKavenegarEntry | IKavenegarEntry[];
}

@Injectable()
export class KavenegarSmsProvider implements ISmsProvider {
  readonly name = 'kavenegar' as const;
  private readonly logger = new Logger(KavenegarSmsProvider.name);
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.getOrThrow<string>('KAVENEGAR_API_KEY');
  }

  async sendLookup(
    receptor: string,
    template: string,
    tokens: ISmsLookupTokens,
  ): Promise<ISmsSendResult> {
    const params = new URLSearchParams({
      receptor,
      template,
      token: tokens.token,
    });
    if (tokens.token2) params.set('token2', tokens.token2);
    if (tokens.token3) params.set('token3', tokens.token3);
    if (tokens.token10) params.set('token10', tokens.token10);
    if (tokens.token20) params.set('token20', tokens.token20);

    const url = `https://api.kavenegar.com/v1/${this.apiKey}/verify/lookup.json?${params.toString()}`;
    return this.request(url);
  }

  async sendSms(receptor: string, message: string): Promise<ISmsSendResult> {
    const sender = this.config.get<string>('KAVENEGAR_SENDER') ?? '';
    const params = new URLSearchParams({ receptor, message });
    if (sender) params.set('sender', sender);
    const url = `https://api.kavenegar.com/v1/${this.apiKey}/sms/send.json?${params.toString()}`;
    return this.request(url);
  }

  private async request(url: string): Promise<ISmsSendResult> {
    try {
      const res = await fetch(url, { method: 'GET' });
      const body = (await res.json()) as IKavenegarResponse;
      if (!res.ok || body.return.status !== 200) {
        this.logger.warn(
          `Kavenegar failed status=${body.return?.status} message=${body.return?.message}`,
        );
        throw new BadGatewayException('SMS provider unavailable');
      }
      const entries = Array.isArray(body.entries)
        ? body.entries
        : body.entries
          ? [body.entries]
          : [];
      const messageId = entries[0]?.messageid != null ? String(entries[0].messageid) : null;
      return { messageId, provider: this.name };
    } catch (err) {
      if (err instanceof BadGatewayException) throw err;
      this.logger.error('Kavenegar request failed', err instanceof Error ? err.stack : undefined);
      throw new BadGatewayException('SMS provider unavailable');
    }
  }
}
