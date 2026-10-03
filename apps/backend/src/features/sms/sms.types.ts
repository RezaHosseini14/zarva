export type SmsProviderName = 'console' | 'kavenegar';

export interface ISmsLookupTokens {
  readonly token: string;
  readonly token2?: string;
  readonly token3?: string;
  readonly token10?: string;
  readonly token20?: string;
}

export interface ISmsSendResult {
  readonly messageId: string | null;
  readonly provider: SmsProviderName;
}

export interface ISmsProvider {
  readonly name: SmsProviderName;
  sendLookup(
    receptor: string,
    template: string,
    tokens: ISmsLookupTokens,
  ): Promise<ISmsSendResult>;
  sendSms(receptor: string, message: string): Promise<ISmsSendResult>;
}

export const SMS_PROVIDER = Symbol('SMS_PROVIDER');

export const KAVENEGAR_TEMPLATES = {
  otp: 'zarva-otp',
  saleConfirmed: 'zarva-sale-confirmed',
  salePaymentPartial: 'zarva-sale-payment-partial',
  salePaymentPaid: 'zarva-sale-payment-paid',
  saleReady: 'zarva-sale-ready',
  saleCompleted: 'zarva-sale-completed',
  saleVoid: 'zarva-sale-void',
} as const;

/** Fixed OTP accepted only by ConsoleSmsProvider (local/dev). */
export const CONSOLE_OTP_CODE = '000000';
