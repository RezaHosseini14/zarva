import { Injectable, Logger } from '@nestjs/common';

import {
  CONSOLE_OTP_CODE,
  type ISmsLookupTokens,
  type ISmsProvider,
  type ISmsSendResult,
} from './sms.types';

@Injectable()
export class ConsoleSmsProvider implements ISmsProvider {
  readonly name = 'console' as const;
  private readonly logger = new Logger(ConsoleSmsProvider.name);

  async sendLookup(
    receptor: string,
    template: string,
    tokens: ISmsLookupTokens,
  ): Promise<ISmsSendResult> {
    this.logger.log(
      `[console-sms] lookup receptor=${receptor} template=${template} tokens=${JSON.stringify(tokens)} (dev accept OTP=${CONSOLE_OTP_CODE})`,
    );
    return { messageId: `console-${Date.now()}`, provider: this.name };
  }

  async sendSms(receptor: string, message: string): Promise<ISmsSendResult> {
    this.logger.log(`[console-sms] send receptor=${receptor} message=${message}`);
    return { messageId: `console-${Date.now()}`, provider: this.name };
  }
}
