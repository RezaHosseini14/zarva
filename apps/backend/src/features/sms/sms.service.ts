import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { normalizeIranPhone } from './phone.util';
import {
  KAVENEGAR_TEMPLATES,
  SMS_PROVIDER,
  type ISmsLookupTokens,
  type ISmsProvider,
  type ISmsSendResult,
} from './sms.types';

@Injectable()
export class SmsService {
  private readonly otpTemplate: string;

  constructor(
    @Inject(SMS_PROVIDER) private readonly provider: ISmsProvider,
    private readonly config: ConfigService,
  ) {
    this.otpTemplate =
      this.config.get<string>('KAVENEGAR_OTP_TEMPLATE') ?? KAVENEGAR_TEMPLATES.otp;
  }

  get providerName(): string {
    return this.provider.name;
  }

  async sendOtp(phone: string, code: string): Promise<ISmsSendResult> {
    return this.provider.sendLookup(this.receptor(phone), this.otpTemplate, { token: code });
  }

  async sendLookup(
    phone: string,
    template: string,
    tokens: ISmsLookupTokens,
  ): Promise<ISmsSendResult> {
    return this.provider.sendLookup(this.receptor(phone), template, tokens);
  }

  async sendSms(phone: string, message: string): Promise<ISmsSendResult> {
    return this.provider.sendSms(this.receptor(phone), message);
  }

  private receptor(phone: string): string {
    try {
      return normalizeIranPhone(phone);
    } catch {
      throw new BadRequestException('Invalid phone number');
    }
  }
}
